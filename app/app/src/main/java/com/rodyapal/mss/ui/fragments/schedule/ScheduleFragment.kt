package com.rodyapal.mss.ui.fragments.schedule

import android.content.Context
import android.content.res.Resources
import android.os.Bundle
import android.view.*
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.NavArgs
import androidx.navigation.fragment.findNavController
import androidx.navigation.fragment.navArgs
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.bottomsheet.BottomSheetBehavior
import com.rodyapal.mss.R
import com.rodyapal.mss.data.model.IWeekSelector
import com.rodyapal.mss.data.model.one.Lesson
import com.rodyapal.mss.data.model.one.getWeekSchedule
import com.rodyapal.mss.databinding.ScheduleFragmentBinding
import com.rodyapal.mss.utils.CURRENT_GROUP_PREFERENCE
import com.rodyapal.mss.utils.CURRENT_GROUP_PREFERENCE_NAME
import com.rodyapal.mss.utils.capital
import com.rodyapal.mss.viewmodels.ScheduleViewModel
import java.util.*

class ScheduleFragment : Fragment(), IWeekSelector {

	private lateinit var scheduleViewModel: ScheduleViewModel

	private var _binding: ScheduleFragmentBinding? = null
	private val binding get() = _binding!!

	private val args: ScheduleFragmentArgs by navArgs()

	private val sharedPreferences by lazy {
		requireContext().applicationContext.getSharedPreferences(
			CURRENT_GROUP_PREFERENCE, Context.MODE_PRIVATE)
	}

	private val scheduleListController: ScheduleListController by lazy {
		ScheduleListController(requireContext())
	}
	private val weekPickerListController: WeekPickerListController by lazy {
		WeekPickerListController(this)
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
		setHasOptionsMenu(true)
		BottomSheetBehavior.from(binding.schBtmSheet).apply {
			peekHeight = 96
			state = BottomSheetBehavior.STATE_COLLAPSED
		}
		setUpRecyclerView()
		getSchedule()
		return binding.root
	}

	private fun getSchedule() {
		if (args.groupName == null) {
			Toast.makeText(requireContext(), "Something gone wrong...", Toast.LENGTH_SHORT).show()
			findNavController().navigateUp()
		} else args.groupName?.let { name ->
			scheduleListController.isLoading = true
			scheduleViewModel.getDataForGroup(name)
			scheduleViewModel.group.observe(viewLifecycleOwner) { group ->
				with(scheduleViewModel) {
					scheduleListController.data = group.getWeekSchedule(getCurrentWeekFromTermStart())
					scheduleListController.headerPositions[fragmentTitle]?.let {
						binding.schRvSchedule.smoothScrollToPosition(
							it
						)
					}
					fragmentTitle = getString(R.string.week_index, getCurrentWeekFromTermStart())
				}
			}
		}
	}

	private fun setUpRecyclerView() {
		with(binding.schRvSchedule) {
			setController(scheduleListController)
			layoutManager =
				LinearLayoutManager(requireContext(), LinearLayoutManager.VERTICAL, false)
		}
		with(binding.schRvWeekPicker) {
			setController(weekPickerListController)
			layoutManager =
				GridLayoutManager(requireContext(), 4)
		}
		weekPickerListController.requestModelBuild()
	}

	override fun onCreateOptionsMenu(menu: Menu, inflater: MenuInflater) {
		inflater.inflate(R.menu.schedule_fragment_menu, menu)
	}

	override fun onOptionsItemSelected(item: MenuItem): Boolean {
		when (item.itemId) {
			R.id.sch_menu_refresh_data -> args.groupName?.let { name ->
				scheduleListController.isLoading = true
				scheduleViewModel.refreshDataForGroup(name)
			}
			R.id.sch_menu_logout -> {
				sharedPreferences.edit().remove(CURRENT_GROUP_PREFERENCE_NAME).apply()
				findNavController().navigateUp()
			}
		}
		return true
	}

	override fun onDestroyView() {
		super.onDestroyView()
		_binding = null
	}

	override fun onItemClick(weekIndex: String) {
		scheduleViewModel.group.value?.let { group ->
			scheduleListController.isLoading = true
			scheduleListController.data = group.getWeekSchedule(weekIndex.toInt())
			scheduleListController.headerPositions[fragmentTitle]?.let {
				binding.schRvSchedule.smoothScrollToPosition(
					it
				)
			}
			fragmentTitle = getString(R.string.week_index, weekIndex.toInt())
		}
	}
}