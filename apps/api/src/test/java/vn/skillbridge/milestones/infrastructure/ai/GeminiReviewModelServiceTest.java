package vn.skillbridge.milestones.infrastructure.ai;

import static org.assertj.core.api.Assertions.*;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;
import vn.skillbridge.milestones.domain.*;

class GeminiReviewModelServiceTest {
    @Test void callsStructuredOutputWithHeaderKeyAndValidatesResponse()throws Exception{
        var json=new JsonMapper();var server=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);
        server.createContext("/models/test-model:generateContent",exchange->{
            assertThat(exchange.getRequestHeaders().getFirst("x-goog-api-key")).isEqualTo("test-key");
            assertThat(exchange.getRequestURI().getQuery()).isNull();
            var request=json.readTree(exchange.getRequestBody().readAllBytes());
            assertThat(request.path("generationConfig").path("responseMimeType").asText()).isEqualTo("application/json");
            assertThat(request.path("generationConfig").path("responseJsonSchema").path("required").toString()).contains("summary","limitations");
            assertThat(request.path("systemInstruction").path("parts").get(0).path("text").asText()).contains("nextStep","không chấm điểm tổng");
            assertThat(request.has("tools")).isFalse();
            var report=new ReviewReport(List.of(new ReviewReport.Item("c1",ReviewReport.EvidenceStatus.EVIDENCE_FOUND,List.of(new ReviewReport.Quote("note","Evidence")),null,
                "Có thông tin liên quan.","Chưa xác minh được hành vi thực tế.","SME kiểm tra trên sản phẩm.")),"Advisory","Có bằng chứng trong nội dung gửi lên.",List.of("Có trích dẫn phù hợp."),List.of("Chưa kiểm tra sản phẩm chạy thật."));
            byte[] result=json.writeValueAsBytes(Map.of("candidates",List.of(Map.of("finishReason","STOP","content",Map.of("parts",List.of(Map.of("text",json.writeValueAsString(report)))))),"usageMetadata",Map.of("promptTokenCount",12,"candidatesTokenCount",20)));
            exchange.sendResponseHeaders(200,result.length);exchange.getResponseBody().write(result);exchange.close();
        });server.start();
        try{
            var model=new GeminiReviewModelService(json,"test-key","test-model","http://127.0.0.1:"+server.getAddress().getPort());
            var result=model.review(List.of(new Milestone.Criterion("c1","Form")),List.of(new ReviewReport.Source("note","Note",null,"Evidence")),List.of());
            assertThat(result.inputTokens()).isEqualTo(12);assertThat(result.report().items()).hasSize(1);
        }finally{server.stop(0);}
    }
    @Test void absentKeyDisablesOnlyAi(){assertThat(new GeminiReviewModelService(new JsonMapper(),"","test-model","https://example.com").available()).isFalse();}
}
