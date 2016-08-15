using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;

namespace AlarmTestTools
{
    public partial class TestRule : Form
    {
        public TestRule()
        {
            InitializeComponent();
        }

        private void TestRule_Load(object sender, EventArgs e)
        { 
        }

        public void BindTS(DataTable table)
        {
            cbxTSList.Items.Clear();
            foreach (DataRow row in table.Rows)
            {
                TextValue tv = new TextValue() { Text = string.Format("{0}" ,row["wtname"]), Value = string.Format("{0}", row["wtid"]) };
                cbxTSList.Items.Add(tv,true);
            }
        }

        /// <summary>
        ///     要生成告警的升压站
        /// </summary>
        public string[] TSIds
        {
            get
            {
                IList<string> ids = new List<string>();

                foreach(object v in  cbxTSList.CheckedItems)
                {
                    TextValue tv = v as TextValue;

                    if(tv != null)
                    {
                        ids.Add( string.Format("{0}",  tv.Value));
                    }
                }

                return ids.ToArray<string>();
            }
        }

        /// <summary>
        ///     报警消息模板
        /// </summary>
        public string Templs
        { get
            {
                return textBox1.Text;
            }
        }
        
        /// <summary>
        ///     发送消息的时间间隔
        /// </summary>
        public int SendTimeSpan
        {
            get
            {
                return (int)numTimeSpan.Value;
            }
        }

        /// <summary>
        ///     最大线程数量
        /// </summary>
        public int MaxThreadCount
        {
            get
            {
                return (int)numMaxThread.Value;
            }
        }

        /// <summary>
        ///     消息类型
        /// </summary>
        public int MessageType
        {
            get
            {
                int retVal = radioButton1.Checked ? 1 : 0;
                retVal = radioButton3.Checked ? 2 : retVal;
                return retVal;
            }
        }


        private void button1_Click(object sender, EventArgs e)
        {
            this.DialogResult = DialogResult.OK;
        }
    }
}
