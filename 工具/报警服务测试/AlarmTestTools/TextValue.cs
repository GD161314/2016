using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AlarmTestTools
{
   public class TextValue
    {
        public string Text { get; set; }
        public object Value { get; set; }

        public override string ToString()
        {
            return string.Format("({0}){1}", Value, Text) ;
        }
    }
}
