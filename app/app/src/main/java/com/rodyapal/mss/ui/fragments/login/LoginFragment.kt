package com.rodyapal.mss.ui.fragments.login

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import androidx.lifecycle.ViewModelProvider
import com.rodyapal.mss.R
import com.rodyapal.mss.databinding.FragmentLoginBinding
import com.rodyapal.mss.viewmodels.LoginViewModel

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
        loginViewModel.groups.observe(viewLifecycleOwner) { names ->
            val adapter = ArrayAdapter(requireContext(), R.layout.group_hint_list_item, R.id.gh_autocomplete_list_item, names)
            binding.lfTvGroupName.setAdapter(adapter)
            binding.lfTvGroupName.threshold = 1
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}