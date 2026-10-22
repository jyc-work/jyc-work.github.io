from pathlib import Path
import sqlite3,sys,tempfile,unittest
from concurrent.futures import ThreadPoolExecutor
ROOT=Path(__file__).resolve().parents[1]
for p in [ROOT/'agent_loop', ROOT/'kafka_lag', ROOT/'idempotency']:
    sys.path.insert(0,str(p))
from loop import ToolHarness,ScriptedModel,Call
from analyze import parse_snapshot,compare
from store import init,handle

class AgentTests(unittest.TestCase):
    def test_success(self):
        out=ToolHarness().run(ScriptedModel([Call('a','add',{'a':2,'b':3}),'5']))
        self.assertEqual((out.status,out.answer),('done','5'))
    def test_invalid_input_and_unknown_tool(self):
        out=ToolHarness().run(ScriptedModel([Call('a','add',{'a':True,'b':3}),Call('b','shell',{}),'done']))
        self.assertEqual(sum(e['event']=='tool_rejected' for e in out.events),2)
    def test_write_requires_approval(self):
        h=ToolHarness()
        h.run(ScriptedModel([Call('a','put',{'key':'x','value':'secret'}),'done']))
        self.assertFalse(h.store)
    def test_idempotency_and_conflict(self):
        h=ToolHarness(approved_writes=True)
        out=h.run(ScriptedModel([Call('x','put',{'key':'a','value':'1'}),Call('x','put',{'key':'a','value':'1'}),Call('x','put',{'key':'a','value':'2'}),'done']))
        self.assertEqual(h.store,{'a':'1'})
        self.assertIn('deduplicated',[e['event'] for e in out.events])
        self.assertIn('tool_rejected',[e['event'] for e in out.events])
    def test_budget_exhaustion(self):
        out=ToolHarness(max_steps=1).run(ScriptedModel([Call('a','add',{'a':1,'b':2}),'done']))
        self.assertEqual(out.status,'budget_exhausted')

class KafkaTests(unittest.TestCase):
    def test_sample_offsets(self):
        a=parse_snapshot((ROOT/'kafka_lag'/'before.txt').read_text())
        b=parse_snapshot((ROOT/'kafka_lag'/'after.txt').read_text())
        rows=compare(a,b,30)
        self.assertEqual(rows[0]['lag_delta'],45)
        self.assertEqual(rows[0]['new_records_per_s'],2.0)
        self.assertEqual(rows[1]['lag_delta'],-5)
    def test_offset_reset_and_partition_change(self):
        a=parse_snapshot('g events 0 100 200 100\n')
        b=parse_snapshot('g events 0 0 10 10\n')
        with self.assertRaises(ValueError): compare(a,b,30)
        with self.assertRaises(ValueError): compare(a,{},30)
    def test_missing_value(self):
        with self.assertRaises(ValueError): parse_snapshot('g events 0 - 10 - client\n')

class TransactionTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.db=Path(self.tmp.name)/'example.db'
        init(self.db)
    def tearDown(self): self.tmp.cleanup()
    def test_same_request_one_row(self):
        self.assertEqual(handle(self.db,'r1',{'value':'a'}),handle(self.db,'r1',{'value':'a'}))
        with sqlite3.connect(self.db) as conn:
            self.assertEqual(conn.execute('SELECT COUNT(*) FROM records').fetchone()[0],1)
    def test_same_key_different_payload_conflict(self):
        handle(self.db,'r1',{'value':'a'})
        with self.assertRaises(ValueError): handle(self.db,'r1',{'value':'b'})
    def test_rollback_before_commit(self):
        with self.assertRaises(RuntimeError):
            handle(self.db,'r1',{'value':'a'},fail_before_commit=True)
        with sqlite3.connect(self.db) as conn:
            self.assertEqual(conn.execute('SELECT COUNT(*) FROM records').fetchone()[0],0)
        self.assertEqual(handle(self.db,'r1',{'value':'a'})['value'],'a')
    def test_concurrent_duplicate_calls(self):
        with ThreadPoolExecutor(max_workers=2) as pool:
            a,b=list(pool.map(lambda _:handle(self.db,'r1',{'value':'a'}),range(2)))
        self.assertEqual(a,b)
        with sqlite3.connect(self.db) as conn:
            self.assertEqual(conn.execute('SELECT COUNT(*) FROM records').fetchone()[0],1)
if __name__=='__main__': unittest.main()
