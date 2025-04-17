import io.restassured.RestAssured;
import io.restassured.response.Response;
import org.apache.http.HttpStatus;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.notNullValue;

public class AuthIntegrationTest {

    @BeforeAll
    static void setUpBeforeClass() {
        RestAssured.baseURI = "http://localhost";
        RestAssured.port = 4004;
    }

    @Test
    public void shouldReturnOKWithValidToken() {
        // 1. Arrange
        String loginPayload = """
                {
                "email": "testing@test.com",
                "password": "password123"
                }
                """;

        // 2. Act &&
        // 3. Assert

        Response response = given()
                .contentType("application/json")
                .body(loginPayload)
                .when()
                .post("/auth/login")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .body("token", notNullValue())
                .extract()
                .response();

        System.out.println("Generated token: " + response.jsonPath().getString("token"));

    }

    @Test
    public void shouldReturnUnauthorisedOnInvalidLogin() {

        String loginPayload = """
                {
                "email": "testing@test.com",
                "password": "wrong_password"
                }
                """;

        given()
        .contentType("application/json")
                .body(loginPayload)
                .when()
                .post("/auth/login")
                .then()
                .statusCode(HttpStatus.SC_UNAUTHORIZED);
    }
}