
    /// <summary>
    ///     ��õ�¼��ʽֵ,31211, 20160525
    ///     �����ã�ȫ�����ô���ʹ��ȫ����¼��ʽ
    ///     ������ȷ���ӣ����ţ�sms; ����+����sms,dog;����+����+����pwd,sms,dog
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
