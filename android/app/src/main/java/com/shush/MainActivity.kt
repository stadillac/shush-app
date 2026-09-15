package com.shush

import android.app.role.RoleManager
import android.content.Context
import android.os.Build
import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.shush.auth.SessionStore
import com.shush.auth.SupabaseAuthClient
import com.shush.data.AppDatabase
import com.shush.databinding.ActivityMainBinding
import com.shush.sync.SyncScheduler
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var sessionStore: SessionStore
    private val authClient = SupabaseAuthClient()

    private val roleRequestLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) {
        refreshRoleStatus()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionStore = SessionStore(this)

        binding.btnSignIn.setOnClickListener { signIn() }
        binding.btnEnableCallBlocking.setOnClickListener { requestCallScreeningRole() }
        binding.btnSyncNow.setOnClickListener { triggerSync() }

        updateSignedInUi()
        refreshRoleStatus()
        refreshBlockedNumbersList()
    }

    override fun onResume() {
        super.onResume()
        refreshRoleStatus()
        if (sessionStore.load() != null) {
            triggerSync()
        }
    }

    private fun signIn() {
        val email = binding.etEmail.text.toString().trim()
        val password = binding.etPassword.text.toString()

        if (email.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, R.string.error_missing_credentials, Toast.LENGTH_SHORT).show()
            return
        }

        binding.tvAuthStatus.text = getString(R.string.auth_status_signing_in)
        lifecycleScope.launch {
            try {
                val session = authClient.signIn(email, password)
                sessionStore.save(session)
                updateSignedInUi()
                SyncScheduler.schedulePeriodic(this@MainActivity)
                triggerSync()
            } catch (e: Exception) {
                binding.tvAuthStatus.text = e.message ?: getString(R.string.auth_status_failed)
            }
        }
    }

    private fun updateSignedInUi() {
        binding.tvAuthStatus.text = if (sessionStore.load() != null) {
            getString(R.string.auth_status_signed_in)
        } else {
            getString(R.string.auth_status_signed_out)
        }
    }

    private fun requestCallScreeningRole() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            binding.tvRoleStatus.text = getString(R.string.role_status_unsupported)
            return
        }

        val roleManager = getSystemService(Context.ROLE_SERVICE) as RoleManager
        if (roleManager.isRoleHeld(RoleManager.ROLE_CALL_SCREENING)) {
            binding.tvRoleStatus.text = getString(R.string.role_status_granted)
            return
        }
        if (!roleManager.isRoleAvailable(RoleManager.ROLE_CALL_SCREENING)) {
            binding.tvRoleStatus.text = getString(R.string.role_status_unavailable)
            return
        }
        roleRequestLauncher.launch(roleManager.createRequestRoleIntent(RoleManager.ROLE_CALL_SCREENING))
    }

    private fun refreshRoleStatus() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            binding.tvRoleStatus.text = getString(R.string.role_status_unsupported)
            return
        }
        val roleManager = getSystemService(Context.ROLE_SERVICE) as RoleManager
        binding.tvRoleStatus.text = if (roleManager.isRoleHeld(RoleManager.ROLE_CALL_SCREENING)) {
            getString(R.string.role_status_granted)
        } else {
            getString(R.string.role_status_not_granted)
        }
    }

    private fun triggerSync() {
        SyncScheduler.syncNow(this)
        binding.tvSyncStatus.text = getString(R.string.sync_status_running)
        // Best-effort UI refresh shortly after kicking off the one-time
        // sync work. Good enough for now; a WorkInfo LiveData/Flow
        // observer would be a nicer follow-up if you want live progress.
        lifecycleScope.launch {
            delay(3000)
            refreshBlockedNumbersList()
            binding.tvSyncStatus.text = getString(R.string.sync_status_success)
        }
    }

    private fun refreshBlockedNumbersList() {
        lifecycleScope.launch {
            val dao = AppDatabase.get(this@MainActivity).blockedNumberDao()
            val entries = dao.getAll().map { "${it.contactName} — ${it.phoneNumberRaw}" }
            binding.lvBlockedNumbers.adapter = ArrayAdapter(
                this@MainActivity,
                android.R.layout.simple_list_item_1,
                entries.ifEmpty { listOf(getString(R.string.blocked_list_empty)) }
            )
        }
    }
}
