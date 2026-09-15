package com.shush.data

import com.shush.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray

data class RemoteBlockedContact(
    val id: String,
    val contactName: String,
    val contactPhone: String
)

class BlockedContactsApiException(message: String) : Exception(message)

/**
 * Reads the signed-in user's active blocked contacts straight from
 * Supabase's PostgREST API (the `blocked_contacts` table the web app's
 * blockContact()/getBlockedContacts() already write to and read from).
 */
class BlockedContactsApi(private val client: OkHttpClient = OkHttpClient()) {

    private val baseUrl = BuildConfig.SUPABASE_URL.trimEnd('/')
    private val anonKey = BuildConfig.SUPABASE_ANON_KEY

    /**
     * NOTE: the `user_id=eq.$userId` filter below is applied explicitly as
     * defense-in-depth. This query should already be scoped to the caller
     * by Supabase Row Level Security on `blocked_contacts` (a policy like
     * `using (auth.uid() = user_id)`) — see android/README.md for the
     * required policy. Do not remove this filter even once RLS is
     * confirmed; it costs nothing and guards against a future RLS
     * regression exposing other users' contacts to this endpoint.
     */
    suspend fun fetchActiveBlockedContacts(accessToken: String, userId: String): List<RemoteBlockedContact> =
        withContext(Dispatchers.IO) {
            val url = "$baseUrl/rest/v1/blocked_contacts" +
                "?select=id,contact_name,contact_phone" +
                "&status=eq.active" +
                "&contact_phone=not.is.null" +
                "&user_id=eq.$userId"

            val request = Request.Builder()
                .url(url)
                .addHeader("apikey", anonKey)
                .addHeader("Authorization", "Bearer $accessToken")
                .get()
                .build()

            client.newCall(request).execute().use { response ->
                val raw = response.body?.string().orEmpty()
                if (!response.isSuccessful) {
                    throw BlockedContactsApiException("Sync failed (HTTP ${response.code}): $raw")
                }
                val array = JSONArray(raw)
                (0 until array.length()).map { i ->
                    val obj = array.getJSONObject(i)
                    RemoteBlockedContact(
                        id = obj.getString("id"),
                        contactName = obj.optString("contact_name", "Blocked contact"),
                        contactPhone = obj.getString("contact_phone")
                    )
                }
            }
        }
}
