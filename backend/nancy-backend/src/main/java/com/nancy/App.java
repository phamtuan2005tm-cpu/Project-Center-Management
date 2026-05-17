package com.nancy;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

public class App {
    
    // Khai báo thông tin kết nối Database (Hằng số toàn cục)
    private static final String URL = "jdbc:mysql://localhost:3306/en_center_management";
    private static final String USER = "root"; 
    private static final String PASSWORD = "123456"; 

    public static void main(String[] args) {
        try {
            // 1. Tạo một Server lắng nghe tại cổng 8080 trên máy tính của bạn
            HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
            
            // 2. Tạo một đường dẫn API tên là "/api/login" và giao cho lớp LoginHandler xử lý
            server.createContext("/api/login", new LoginHandler());
            
            // 3. Kích hoạt Server chạy mặc định (Không giới hạn thời gian)
            server.setExecutor(null); 
            server.start();
            
            System.out.println("--- NANCY CENTER SYSTEM START ---");
            System.out.println("Server is running smoothly at: http://localhost:8080");
            System.out.println("API Endpoint ready: http://localhost:8080/api/login");
            System.out.println("Press the red square button [Stop] in VS Code to turn off the server.");
            System.out.println("---------------------------------");

        } catch (IOException e) {
            System.err.println("Failed to start Server: " + e.getMessage());
        }
    }

    /**
     * LỚP LOGIC XỬ LÝ (HANDLER): Nơi tiếp nhận yêu cầu từ giao diện Web gửi lên
     */
    static class LoginHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            System.out.println("\n[System] Received a new login request from Frontend!");

            // Giả lập nhận dữ liệu Test từ tài khoản của bạn
            // (Mấy bài sau chúng ta sẽ sửa chỗ này để hứng dữ liệu thật người dùng gõ từ ô Input nhé)
            // String emailFromFrontend = "phamtuan2005tm@gmail.com"; 
            // String passwordFromFrontend = "@Thaituan6";

            String query = exchange.getRequestURI().getQuery(); 

            // 2. Viết một hàm nhỏ để tách đoạn chuỗi đó ra thành dữ liệu thật
            String emailFromFrontend = getParam(query, "email");       // Sẽ đọc được chữ người dùng gõ
            String passwordFromFrontend = getParam(query, "password");   // Sẽ đọc được mật khẩu người dùng gõ
            // Gọi hàm login xuống Database để kiểm tra
            boolean isSuccess = login(emailFromFrontend, passwordFromFrontend);

            // Chuẩn bị câu trả lời gửi ngược lại cho trình duyệt Web
            String responseMessage;
            if (isSuccess) {
                responseMessage = "SUCCESS";
                System.out.println("[Result] Status: 200 OK - Login Success!");
            } else {
                responseMessage = "FAILED";
                System.out.println("[Result] Status: 401 Unauthorized - Login Failed!");
            }

            // 🌟 THÊM DÒNG NÀY: Cho phép tất cả các cổng Frontend (như 5500 của Live Server) được quyền gọi vào Java
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            // Gửi tín hiệu phản hồi (Response) về cho phía Frontend
            exchange.sendResponseHeaders(200, responseMessage.length());
            OutputStream os = exchange.getResponseBody();
            os.write(responseMessage.getBytes());
            os.close();
        }
    }

    /**
     * HÀM TRUY VẤN DATABASE: (Giữ nguyên từ bài trước)
     */
    public static boolean login(String inputEmail, String inputPassword) {
        String sql = "SELECT * FROM users WHERE email = ? AND password = ?";
        try (Connection connection = DriverManager.getConnection(URL, USER, PASSWORD);
             PreparedStatement preparedStatement = connection.prepareStatement(sql)) {

            preparedStatement.setString(1, inputEmail);    
            preparedStatement.setString(2, inputPassword); 

            try (ResultSet resultSet = preparedStatement.executeQuery()) {
                return resultSet.next(); 
            }
        } catch (SQLException e) {
            System.err.println("Database error: " + e.getMessage());
            return false;
        }
    }
    /**
     * HÀM BỔ TRỢ: Tách giá trị của tham số từ chuỗi Query dạng "email=abc&password=123"
     */
    private static String getParam(String query, String paramName) {
        if (query == null || query.isEmpty()) {
            return "";
        }
        // Tách chuỗi bằng dấu & để chia thành các cặp [email=abc] và [password=123]
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            // Tách từng cặp bằng dấu = để phân chia tên tham số và giá trị
            String[] idx = pair.split("=");
            if (idx.length > 1 && idx[0].equals(paramName)) {
                // Trả về giá trị đã tìm thấy (ví dụ: abc)
                return idx[1];
            }
        }
        return "";
    }
}