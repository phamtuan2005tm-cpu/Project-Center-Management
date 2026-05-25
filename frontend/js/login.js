document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("login-form"); 
    
    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault(); 

            // Lấy đúng ID từ file HTML của bạn sang
            const emailInput = document.getElementById("enter-email").value;
            const passwordInput = document.getElementById("enter-password").value;

            console.log("Sending request to Java Server with account:", emailInput);

            // Bắn tín hiệu qua Java Backend cổng 8080
            fetch(`http://localhost:8080/api/login?email=${emailInput}&password=${passwordInput}`)
                .then(response => response.text()) 
                .then(data => {
                    console.log("Gói bưu phẩm nhận được từ Java Backend:", data);

                    if (data.startsWith("SUCCESS")) {
                        const parts = data.split(':'); 
                        const role = parts[1]; // Lấy nhãn vai trò
                        const name = decodeURIComponent(parts[2]); // Giải mã tên tiếng Việt

                        // Cất quyền và tên vào bộ nhớ tạm localStorage của trình duyệt
                        localStorage.setItem("userRole", role);
                        localStorage.setItem("userName", name);

                        alert(`Đăng nhập thành công! Chào mừng ${name} với vai trò [${role}]`);

                        // Đá vèo một cái sang sảnh chính dashboard.html
                        window.location.href = 'dashboard.html';
                    } 
                    else {
                        alert("Mật khẩu hoặc tài khoản Nancy Center không đúng. Vui lòng thử lại!");
                    }
                })
                .catch(error => {
                    console.error("Lỗi kết nối:", error);
                    alert("Không thể kết nối đến Backend chính! Bạn đã bấm nút [Run] cho file App.java chưa?");
                });
        });
    }
});