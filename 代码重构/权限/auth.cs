
    /// <summary>
    ///     获得登录方式值,31211, 20160525
    ///     不配置，全部配置错误，使用全部登录方式
    ///     配置正确例子：短信：sms; 短信+狗：sms,dog;密码+短信+狗：pwd,sms,dog
    /// </summary>
    /// <param name="value"></param>
    private int GetLoginWay(string value)
    {
        IDictionary<string, int> values = new Dictionary<string, int>();

        values.Add("pwd", 1);
        values.Add("sms", 2);
        values.Add("dog", 4);

        string[] vals = value.Split(',');
        int right = 1 | 2 | 4;

        bool first = true;

        foreach (string val in vals)
        {
            if (values.ContainsKey(val))
            {
                if (first == true)
                {
                    right = 0;
                    first = false;
                }
                right |= values[val];
            }
        }

        return right; 
    }
