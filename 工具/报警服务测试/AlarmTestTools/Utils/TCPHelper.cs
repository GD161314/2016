using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;

namespace AlarmTestTools.Utils
{
   public class TCPHelper
    {
        private Socket socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);

        public void Connect(IPAddress ipAddress, int port) {
            socket.Connect(ipAddress, port);

        }

        public bool Connected
        {
            get
            {
                return  socket.Connected;
            }
        }
        public  Byte[] SendData(string data)
        { 
            byte[] recData = new byte[1024];

            byte[] cmdBytes = System.Text.ASCIIEncoding.ASCII.GetBytes(data);  

            socket.Send(cmdBytes);

            socket.Receive(recData);
         
            return recData;
        }

        public void Close()
        {
            socket.Close();
            socket.Dispose();
        }
    }
}
