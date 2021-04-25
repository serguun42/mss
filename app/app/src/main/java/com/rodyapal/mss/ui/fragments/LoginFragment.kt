package com.rodyapal.mss.ui.fragments

import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.ListAdapter
import android.widget.Toast
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.rodyapal.mss.R
import com.rodyapal.mss.data.remote.NetworkResult
import com.rodyapal.mss.databinding.FragmentLoginBinding
import com.rodyapal.mss.viewmodels.LoginViewModel
import java.time.Duration

class LoginFragment : Fragment() {

    private lateinit var loginViewModel: LoginViewModel

    private var _binding: FragmentLoginBinding? = null
    private val binding get() = _binding!!

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        loginViewModel = ViewModelProvider(requireActivity()).get(LoginViewModel::class.java)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding =  FragmentLoginBinding.inflate(inflater, container, false)
        getAllGroups()
        binding.lfBtViewSchedule.setOnClickListener {
            loginViewModel.navigateToScheduleFragment(it, binding.groupName ?: "")
        }
//        val action = LoginFragmentDirections.actionLoginFragmentToScheduleFragment("ИКБО-03-20")
//        findNavController().navigate(action)
        return binding.root
    }

    private fun getAllGroups() {
        loginViewModel.getAllGroups()
        loginViewModel.groupsResponse.observe(viewLifecycleOwner) { result ->
            when (result) {
                is NetworkResult.Success -> {
                    val adapter = result.data?.let { ArrayAdapter(requireContext(), R.layout.group_hint_list_item, R.id.gh_autocomplete_list_item, it.toStringArray()) }
                    binding.lfTvGroupName.setAdapter(adapter)
                    binding.lfTvGroupName.threshold = 1
                }
                is NetworkResult.Error -> {
                    Toast.makeText(requireContext(), "Something gone wrong...", Toast.LENGTH_SHORT).show()
                    Log.e("Network", result.message ?: "No message")
                }
                is NetworkResult.Loading -> {
                    Log.i("Network", "Loading")
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}