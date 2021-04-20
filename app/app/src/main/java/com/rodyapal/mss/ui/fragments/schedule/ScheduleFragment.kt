package com.rodyapal.mss.ui.fragments.schedule

import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.navArgs
import com.rodyapal.mss.R
import com.rodyapal.mss.databinding.ScheduleFragmentBinding
import com.rodyapal.mss.viewmodels.LoginViewModel
import com.rodyapal.mss.viewmodels.ScheduleViewModel

class ScheduleFragment : Fragment() {

    private lateinit var scheduleViewModel: ScheduleViewModel

    private var _binding: ScheduleFragmentBinding? = null
    private val binding get() = _binding!!

    private val args by navArgs<ScheduleFragmentArgs>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        scheduleViewModel = ViewModelProvider(requireActivity()).get(ScheduleViewModel::class.java)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = ScheduleFragmentBinding.inflate(inflater, container, false)
        getSchedule()
        return binding.root
    }

    private fun getSchedule() {
        if (args.groupName == null) {

        } else args.groupName?.let { name ->
            scheduleViewModel.getDataForGroup(name)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}