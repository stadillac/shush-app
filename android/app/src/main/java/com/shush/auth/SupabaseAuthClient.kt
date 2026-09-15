package com.shush.auth

import com.shush.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

/**
 * A signed-in session, mirroring what Supabase's GoTrue /token endpoint
 * returns. expiresAtEpochSeconds lets callers decide when to refresh.
 */
data class AuthSession(
    val accessToken: String,
    val refreshToken: String,
    val userId: String,
    val expiresAtEpochSeconds: Long
)

class SupabaseAuthException(message: String) : Exception(message)

/**
 * Talks directly to Supabase's Auth (GoTrue) REST API over plain HTTPS.
 * No Supabase SDK dependency required — this is the same API the web
 * app's @supabase/supabase-js client calls under the hood.
 */
class SupabaseAuthClient(private val client: OkHttpClient = OkHttpClient()) {

    private val baseUrl = BuildConfig.SUPABASE_URL.trimEnd('/')
    private val anonKey = BuildConfig.SUPABASE_ANON_KEY
    private val jsonMedia = "application/json".toMediaType()

    suspend fun signIn(email: String, password: String): AuthSession = withContext(Dispatchers.IO) {
        val body = JSONObject()
            .put("email", email)
            .put("password", password)
            .toString()
            .toRequestBody(jsonMedia)

        val request = Request.Builder()
            .url("$baseUrl/auth/v1/token?grant_type=password")
            .addHeader("apikey", anonKey)
            .addHeader("Content-Type", "application/json")
            .post(body)
            .build()

        executeAuthRequest(request)
    }

    suspend fun refresh(refreshToken: String): AuthSession = withContext(Dispatchers.IO) {
        val body = JSONObject()
            .put("refresh_token", refreshToken)
            .toString()
            .toRequestBody(jsonMedia)

        val request = Request.Builder()
            .url("$baseUrl/auth/v1/token?grant_type=refresh_token")
            .addHeader("apikey", anonKey)
            .addHeader("Content-Type", "application/json")
            .post(body)
            .build()

        executeAuthRequest(request)
    }

    private fun executeAuthRequest(request: Request): AuthSession {
        client.newCall(request).execute().use { response ->
            val raw = response.body?.string().orEmpty()
            if (!response.isSuccessful) {
                val message = runCatching {
                    JSONObject(raw).optString("error_description", raw)
                }.getOrDefault(raw)
                throw SupabaseAuthException(message.ifBlank { "Sign in failed (HTTP ${response.code})" })
            }
            val json = JSONObject(raw)
            val user = json.getJSONObject("user")
            val expiresIn = json.optLong("expires_in", 3600L)
            return AuthSession(
                accessToken = json.getString("access_token"),
                refreshToken = json.getString("refresh_token"),
                userId = user.getString("id"),
                expiresAtEpochSeconds = System.currentTimeMillis() / 1000 + expiresIn
            )
        }
    }
}
