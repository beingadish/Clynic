import io.restassured.RestAssured;
import org.apache.http.HttpStatus;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.notNullValue;

public class PatientIntegrationTest {

    @BeforeAll
    static void setUpBeforeClass() {
        RestAssured.baseURI = "http://localhost";
        RestAssured.port = 4004;
    }

    @Test
    public void shouldReturnPatientsWithValidToken() {

        // Paylod for getting the Valid Token

        String loginPayload = """
                {
                "email": "testing@test.com",
                "password": "password123"
                }
                """;

        // Extracting the Token
        String token = given()
                .contentType("application/json")
                .body(loginPayload)
                .when()
                .post("/auth/login")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .body("token", notNullValue())
                .extract()
                .jsonPath()
                .get("token");

                // Actual Test whether we are getting the patients or not
                given().
                        header("Authorization", "Bearer " + token)
                        .when()
                        .get("/api/patients")
                        .then()
                        .statusCode(HttpStatus.SC_OK)
                        .body("patients", notNullValue());
    }

}
