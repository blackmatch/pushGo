package me.yian.socketio;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.text.TextUtils;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;

import com.github.nkzawa.emitter.Emitter;
import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;
import com.google.gson.Gson;

import org.json.JSONException;
import org.json.JSONObject;

import java.net.URISyntaxException;

public class MainActivity extends AppCompatActivity {
    private Socket mSocket;
    private TextView mMsg;

    {
        try {
            mSocket = IO.socket("http://192.168.0.112:3000");
        } catch (URISyntaxException e) {
        }
    }

    /**
     * 监听其它user 发送的消息：onNewMessage 是啥，一个监听器的实例
     */
    private Emitter.Listener onNewMessage = new Emitter.Listener() {
        @Override
        public void call(final Object... args)
        {
            // 这里注意，时刻要保证运行在ui线程
            runOnUiThread(new Runnable() {
                @Override
                public void run()
                {
                    JSONObject data = (JSONObject) args[0];
                    String username;
                    String message;
                    try {
                        username = data.getString("username");
                        message = data.getString("message");
                    } catch (JSONException e) {
                        return;
                    }

                    // add the message to view
                    addMessage(username, message);
                }
            });
        }

    };

    private Emitter.Listener connectMsg = new Emitter.Listener() {
        @Override
        public void call(final Object... args)
        {
            // 这里注意，时刻要保证运行在ui线程
            runOnUiThread(new Runnable() {
                @Override
                public void run()
                {
                    Log.e(MainActivity.this.getClass().getName(), "connect ok");
                }
            });
        }

    };

    // set msg
    private void addMessage(String username, String message)
    {
        mMsg.setText("username：" + username + " msg：" + message);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        mInputMessageView = (EditText) findViewById(R.id.id_content);
        mMsg = (TextView) findViewById(R.id.id_newMsg);
        mSocket.on("new message", onNewMessage);    // 监听服务器返回的msg
        mSocket.on("connect", connectMsg);    // 监听服务器返回的msg
        mSocket.connect();  // 与socket.io 进行连接，这里生命周期使用activity的
    }

    private EditText mInputMessageView;

    private void attemptSend()
    {
        String message = mInputMessageView.getText().toString().trim();
        if (TextUtils.isEmpty(message)) {
            return;
        }

        MsgContent msgContent = new MsgContent();
        msgContent.setMsg(message);
        MsgModel msgModel = new MsgModel();
        msgModel.setSender("testSenderId");
        msgModel.setReceiver("testReceiverId");
        msgModel.setContent(msgContent);
        String s1 = new Gson().toJson(msgModel);

        mMsg.setText("少年你刚才send的内容是：\n" + s1);

        mSocket.emit("authentication", message);
    }

    // 避免内存泄漏，要关闭socket
    @Override
    public void onDestroy()
    {
        super.onDestroy();
        mSocket.disconnect();   // 关闭链接
        mSocket.off("new message", onNewMessage);   //移除监听
    }

    public void clickMe(View view)
    {
        attemptSend();
    }

}
