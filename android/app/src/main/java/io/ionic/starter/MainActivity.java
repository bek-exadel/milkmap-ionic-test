package io.ionic.starter;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
//import com.getcapacitor.plugin.http.Http;
//import com.getcapacitor.community.database.sqlite.CapacitorSQLite;
import com.getcapacitor.community.database.sqlite.CapacitorSQLitePlugin;

import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    registerPlugin(CapacitorSQLitePlugin.class);


    // Initializes the bridge
//    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
////      add(Http.class);
//      add(CapacitorSQLitePlugin.class);
//    }});
  }
}
