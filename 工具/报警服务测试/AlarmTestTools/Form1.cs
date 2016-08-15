using AlarmTestTools.Utils;
using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace AlarmTestTools
{
    /// <summary>
    ///     测试设备告警服务
    ///     主要功能：
    ///         模拟测试数据
    /// </summary>
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();

            Control.CheckForIllegalCrossThreadCalls = false;

            tipStatus.Text = "就绪";
            tipStatus2.Text = "请选择本地库文件";

            TcpHelper = new TCPHelper();

            LogHelper = new LogHelper(this.GetType());
        }

        private AlarmTester AlarmTester = null;
        private TCPHelper TcpHelper = null;
        private string AlarmMsgTEMPLS = @"(changesave|${tsid}|${iecpath}|${val})";
        private string[] TSIds = new string[] { };
        private LogHelper LogHelper = null;

        public IPAddress AlarmIP
        {
            get
            {

                return IPAddress.Parse(ConfigurationManager.AppSettings["AlarmIP"]);
            }
        }

        public int AlarmPort
        {
            get
            {
                return Int32.Parse(ConfigurationManager.AppSettings["AlarmPort"]);
            }
        }

        /// <summary>
        ///     发送消息的时间间隔
        /// </summary>
        public int SendTimeSpan
        {
            get;
            set;
        }

        public int MessageType
        {
            get; set;
        }

        /// <summary>
        ///     最大线程数量
        /// </summary>
        public int MaxThreadCount
        { get; set; }

        private Stopwatch watch = new Stopwatch();

        private IList<TCPHelper> TcpHelpers = new List<TCPHelper>();

        private bool IsLoopSend = false;

        private void Form1_FormClosing(object sender, FormClosingEventArgs e)
        {
            if (MessageBox.Show("确认退出？", "提示", MessageBoxButtons.OKCancel, MessageBoxIcon.Question) == DialogResult.Cancel)
            {
                e.Cancel = true;
            }
        }

        private void tBtnSelectPath_Click(object sender, EventArgs e)
        {
            OpenFileDialog ofd = new OpenFileDialog();
            ofd.Filter = "本地库文件|*.sqlite";

            if (ofd.ShowDialog() == DialogResult.OK)
            {
                AlarmTester = new AlarmTester(ofd.FileName, AlarmIP, AlarmPort);
                ShowStatus2Text(ofd.FileName);
            }
        }

        private void tBtnSelectFile_Click(object sender, EventArgs e)
        {
            if (AlarmTester != null)
            {
                DataTable table = AlarmTester.GetIECPaths(" and protocolid > 9000 and balarm in(1,2 )");

                dataGridView1.DataSource = table;

                ShowMessageText("记录数：" + table.Rows.Count.ToString() + "条");
            }
        }

        public void ShowMessageText(string text)
        {
            LogHelper.Info(text);
            if(textBox1.Text.Length>1000)
                textBox1.ResetText();
            textBox1.AppendText(string.Format("\r\n{0:yyyy-MM-dd HH:mm:ss} {1}", DateTime.Now, text));
            //textBox1.AppendText("\r\n");
            textBox1.ScrollToCaret();
        }

        public void ShowStatusText(string text)
        {
            tipStatus.Text = text;
        }

        public void ShowStatus2Text(string text)
        {
            tipStatus2.Text = text;
        }
        private static ManualResetEvent loopDone =  new ManualResetEvent(false);
        private void tBtnExportExcel_Click(object sender, EventArgs e)
        {

            if (AlarmTester == null)
            {
                return;
            }

            TestRule rule = new TestRule();

            rule.BindTS(AlarmTester.GetTS());

            if (rule.ShowDialog() == DialogResult.OK)
            {
                try
                {
                    TSIds = rule.TSIds;
                    AlarmMsgTEMPLS = rule.Templs;
                    SendTimeSpan = rule.SendTimeSpan;
                    MaxThreadCount = rule.MaxThreadCount;
                    MessageType = rule.MessageType;
                    //TcpHelper.Connect(AlarmIP, AlarmPort);
                    watch.Start();
                    timer1.Enabled = true;
                    if (MessageType == 2)
                    {
                        IsLoopSend = true;
                        SendTestDataLoop();
                    }
                    else
                    { 
                        SendTestDataMultiThread();
                    }
                    //SendTestData();
                }
                catch (Exception ex)
                {
                    ShowMessageText(ex.Message);
                }
            }
        }

        private static object lockProcessBarVal = new object();

        private void SendTestData(IList<String> list, TCPHelper tcpHeler)
        { 
            if(!tcpHeler.Connected)
                tcpHeler.Connect(AlarmIP, AlarmPort);

            Task task = new TaskFactory().StartNew(() =>
            {

                foreach (String msg in list)
                {
                    try
                    {
                        byte[] retVal = tcpHeler.SendData(msg);

                        lock (lockProcessBarVal)
                        {
                            tProcessBar.Value += 1;
                            if(tProcessBar.Value ==1)
                                loopDone.Set();
                        }

                        ShowMessageText(msg + ":" + System.Text.Encoding.ASCII.GetString(retVal));

                        Thread.Sleep(SendTimeSpan);
                    }
                    catch (Exception ex)
                    {
                        ShowMessageText(ex.Message);
                    }
                }
            });
        }

        /// <summary>
        ///     循环发送数据
        /// </summary>
        private void SendTestDataLoop()
        {
            int span = 10 * 1000;

            new TaskFactory().StartNew(()=>{
                while (true)
                { 
                    lock (lockProcessBarVal)
                    {    
                        if (tProcessBar.Value > 0 &&  tProcessBar.Value < tProcessBar.Maximum)
                        {
                            Thread.Sleep(0);
                            continue;
                        }
                    }
                    if (tProcessBar.Value == tProcessBar.Maximum)
                        Thread.Sleep(span);

                    loopDone.Reset();
                    MessageType = MessageType == 1 ? 0 : 1;
                    SendTestDataMultiThread();
                    loopDone.WaitOne();

                }
            });
        }

        /// <summary>
        ///     多线程发送报警消息
        /// </summary>
        private void SendTestDataMultiThread()
        {
            //将所有待发送的报警消息分成N组，N由MaxThreadCount决定
            int count = 0;
            IList<String>[] listArray = GetMessageListArray(out count); 

            tProcessBar.Maximum = count;
            tProcessBar.Value = 0;
            int groupIndex = 0;
            foreach (IList<String> list in listArray)
            {
                if (list != null && list.Count > 0)
                {
                    try
                    { 
                        TCPHelper tcpHeler = null;

                        if(groupIndex < TcpHelpers.Count)
                        {
                            tcpHeler = TcpHelpers[groupIndex];
                        }
                        else
                        {
                            tcpHeler = new TCPHelper();
                            TcpHelpers.Add(tcpHeler);
                        }

                        SendTestData(list, tcpHeler);

                    }
                    catch (Exception ex)
                    {
                        ShowMessageText(ex.Message);
                    }

                    groupIndex++;
                }
            } 
        }




        public IList<String>[] GetMessageListArray(out int msgCount)
        {
            IList<String>[] retVal = null;
            IList<String> list = ParseList();
            int arrayLength = (int)Math.Ceiling(list.Count * 1.0 / MaxThreadCount * 1.0);

            msgCount = list.Count;

            retVal = new List<String>[MaxThreadCount];

            for (int i = 0; i < retVal.Length; i++)
            {
                retVal[i] = new List<String>();
            }

            for (int i = 0; i < list.Count; i++)
            {
                try
                {
                    retVal[i / arrayLength].Add(list[i]);
                }
                catch (Exception ex)
                {
                    ShowMessageText(i.ToString());
                    ShowMessageText((i % arrayLength).ToString());
                }
            }

            return retVal;
        }

        private IList<string> ParseList()
        {
            IList<String> list = new List<String>();
            DataTable table = dataGridView1.DataSource as DataTable;

            if (table != null)
            {
                foreach (string id in TSIds)
                {
                    DataRow[] rows = table.Select(string.Format("wtid='{0}'", id));

                    foreach (DataRow row in rows)
                    {
                        try
                        {
                            string alarmMsg = AlarmMsgTEMPLS
                                                .Replace("${tsid}", id)
                                                .Replace("${iecpath}", string.Format("{0}", row["iecpath"]))
                                                .Replace("${val}", string.Format("{0}", MessageType));
                            list.Add(alarmMsg);
                        }
                        catch (Exception ex)
                        {
                            ShowMessageText(ex.Message);
                        }
                    }
                }
            }

            return list;
        }



        private void SendTestData()
        {
            Task task = new TaskFactory().StartNew(() =>
            {

                DataTable table = dataGridView1.DataSource as DataTable;
                if (table != null)
                {
                    foreach (string id in TSIds)
                    {
                        DataRow[] rows = table.Select(string.Format("wtid='{0}'", id));

                        ShowMessageText(string.Format("升压站ID：{0}, 报警数量：{1}", id, rows.Count()));
                        int tempCount = 0;
                        tProcessBar.Maximum = rows.Count();

                        foreach (DataRow row in rows)
                        {
                            try
                            {
                                tProcessBar.Value = tempCount++;
                                //(changesave|${tsid}|${iecpath}|${val})
                                string alarmMsg = AlarmMsgTEMPLS
                                                    .Replace("${tsid}", id)
                                                    .Replace("${iecpath}", string.Format("{0}", row["iecpath"]))
                                                    .Replace("${val}", string.Format("{0}", MessageType));

                                byte[] retVal = TcpHelper.SendData(alarmMsg);

                                ShowMessageText(alarmMsg + ":" + System.Text.Encoding.ASCII.GetString(retVal));

                                Thread.Sleep(SendTimeSpan);
                            }
                            catch (Exception ex)
                            {
                                ShowMessageText(ex.Message);
                            }
                        }
                    }

                    if (TSIds.Length > 0)
                        ShowMessageText("报警数据发送完毕.");
                }
            });
        }

        private void timer1_Tick(object sender, EventArgs e)
        {
            if(tProcessBar.Value == tProcessBar.Maximum && !IsLoopSend)
            {
                watch.Stop();
                timer1.Stop();
            }

            tsslTime.Text =string.Format("{0:N2}s", watch.ElapsedMilliseconds*1.0 / 1000 * 1.0);
        }

        private void Form1_MinimumSizeChanged(object sender, EventArgs e)
        {
            this.WindowState = FormWindowState.Minimized;
            this.notifyIcon1.Visible = true;
            this.Hide();
        }

        private void notifyIcon1_MouseDoubleClick(object sender, MouseEventArgs e)
        {
            if (this.Visible)
            {
                this.WindowState = FormWindowState.Minimized;
                this.notifyIcon1.Visible = true;
                this.Hide();
            }
            else
            {
                this.Visible = true;
                this.WindowState = FormWindowState.Normal;
                this.Activate();
            }
        }
    }


}
