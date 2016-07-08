using AlarmTestTools.DAL;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Text;

namespace AlarmTestTools
{
    public class AlarmTester
    {
        public AlarmTester(string dbFile, IPAddress ip, int port)
        {
            DBFile = dbFile;
            AlarmIP = ip;
            AlarmPort = port;
        }

        public string DBFile { get; set; }

        public IPAddress AlarmIP { get; set; }

        public int AlarmPort { get; set; }

        public DataTable GetIECPaths(string filter)
        {
            DataSet ds = SQLiteHelper.ExecuteDataSet(
                 string.Format("Data Source={0};Version=3;", DBFile),
                 string.Format(@"select aa.wtid wtid, aa.wtname wtname, aa.protocolid protocolid, aa.descrcn descrcn, bb.iecpath iecpath, bb.balarm balarm  from
                                (
                                select b.wtid wtid, b.wtname wtname, a.protocolid protocolid, a.descrcn descrcn   from
                                (select *  from wttypeinfo
                                where devicetype = 1
                                ) a inner join (select * from wtinfo) b
                                on a.protocolid = b.protocolid
                                ) aa left join  (select * from propaths where 1=1  {0}) bb
                                on aa.protocolid = bb.protocolid", filter)
                , null);
            return ds != null && ds.Tables.Count>0? ds.Tables[0]: null ;
        }

        /// <summary>
        ///     获得升压站
        /// </summary>
        /// <returns></returns>
        public DataTable GetTS()
        {
            DataSet ds = SQLiteHelper.ExecuteDataSet(
                 string.Format("Data Source={0};Version=3;", DBFile),
                 @"select b.wtid wtid, b.wtname wtname, a.protocolid protocolid, a.descrcn descrcn   from
                    (select *  from wttypeinfo
                    where devicetype = 1
                    ) a inner join (select * from wtinfo) b
                    on a.protocolid = b.protocolid"
                , null);
            return ds != null && ds.Tables.Count>0? ds.Tables[0]: null ; 
        }
    }
}
