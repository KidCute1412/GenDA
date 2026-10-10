package vn.skillbridge.milestones.infrastructure.http;

import java.net.URI;
import java.net.HttpURLConnection;
import java.util.Map;
import java.io.IOException;
import vn.skillbridge.milestones.domain.MilestoneViolation;

public final class RemoteRequest {
    private RemoteRequest() {}
    public static byte[] send(String url,String method,Map<String,String> headers,byte[] body,int limit,String prefix) {
        HttpURLConnection connection=null;
        try {
            connection=(HttpURLConnection)URI.create(url).toURL().openConnection();
            connection.setConnectTimeout(5000);connection.setReadTimeout(30000);connection.setInstanceFollowRedirects(false);
            connection.setRequestMethod(method);headers.forEach(connection::setRequestProperty);
            if(body!=null){connection.setDoOutput(true);connection.setFixedLengthStreamingMode(body.length);try(var out=connection.getOutputStream()){out.write(body);}}
            int status=connection.getResponseCode();
            if(status<200||status>=300) throw new MilestoneViolation(prefix+(status==429?"_QUOTA":"_UNAVAILABLE"),"Remote service is unavailable; please try again");
            try(var in=connection.getInputStream()) {byte[] bytes=in.readNBytes(limit+1);if(bytes.length>limit)throw new MilestoneViolation(prefix+"_TOO_LARGE","Remote response exceeded the limit");return bytes;}
        }catch(java.net.SocketTimeoutException e){throw new MilestoneViolation(prefix+"_TIMEOUT","Remote service timed out; please try again");}
        catch(IOException e){throw new MilestoneViolation(prefix+"_UNAVAILABLE","Remote service is unavailable; please try again");}
        finally{if(connection!=null)connection.disconnect();}
    }
}
