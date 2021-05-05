package com.rodyapal.mss.ui.fragments.schedule

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import androidx.navigation.fragment.navArgs
import androidx.recyclerview.widget.LinearLayoutManager
import com.rodyapal.mss.databinding.ScheduleFragmentBinding
import com.rodyapal.mss.viewmodels.ScheduleViewModel
import java.util.*

class ScheduleFragment : Fragment() {

	private lateinit var scheduleViewModel: ScheduleViewModel

	private var _binding: ScheduleFragmentBinding? = null
	private val binding get() = _binding!!

	private val args by navArgs<ScheduleFragmentArgs>()

	private val scheduleAdapter by lazy {
		ScheduleAdapter()
	}

	private var fragmentTitle: String = "Schedule"
		set(value) {
			field = value
			activity?.let { activity -> (activity as AppCompatActivity).supportActionBar?.title = fragmentTitle }!!
		}

	override fun onCreate(savedInstanceState: Bundle?) {
		super.onCreate(savedInstanceState)
		scheduleViewModel = ViewModelProvider(requireActivity()).get(ScheduleViewModel::class.java)
	}

	override fun onCreateView(
			inflater: LayoutInflater, container: ViewGroup?,
			savedInstanceState: Bundle?
	): View {
		_binding = ScheduleFragmentBinding.inflate(inflater, container, false)
		setUpRecyclerView()
		getSchedule()
		return binding.root
	}

	private fun getSchedule() {
		if (args.groupName == null) {
			Toast.makeText(requireContext(), "Something gone wrong...", Toast.LENGTH_SHORT).show()
			findNavController().navigateUp()
		} else args.groupName?.let { name ->
			scheduleViewModel.getDataForGroup(name)
			scheduleViewModel.group.observe(viewLifecycleOwner) { group ->
				with(scheduleViewModel) {
					scheduleAdapter.setData(getTimetableForDayWeekBased(getScheduleForCurrentDay(group.schedule)))
					fragmentTitle = getDayFromSchedule(group.schedule).capitalize(Locale.getDefault())
				}
			}
		}
	}

	private fun setUpRecyclerView() {
		binding.schRvSchedule.adapter = scheduleAdapter
		binding.schRvSchedule.layoutManager =
				LinearLayoutManager(requireContext(), LinearLayoutManager.VERTICAL, false)
	}

	override fun onDestroyView() {
		super.onDestroyView()
		_binding = null
	}
}