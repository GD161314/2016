using log4net;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AlarmTestTools.Utils
{
    public class LogHelper
    {
        private ILog logHelper = null;

        public LogHelper(Type type)
        {
            logHelper = log4net.LogManager.GetLogger(type);
             
        }

       public void Error(object message)
        {
            logHelper.Error(message);
        }
        public void Error(object message, Exception exception)
        {
            logHelper.Error(message, exception);
        }

        public void Info(object message)
        {
            logHelper.Info(message);
        }

        public void Info(object message, Exception exception)
        {
            logHelper.Info(message, exception);
        }

    }
}
