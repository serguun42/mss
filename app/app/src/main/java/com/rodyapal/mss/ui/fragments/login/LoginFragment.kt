package com.rodyapal.mss.ui.fragments.login

import android.content.Context
import android.os.Bundle
import android.view.*
import android.widget.SearchView
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.StaggeredGridLayoutManager
import com.rodyapal.mss.R
import com.rodyapal.mss.databinding.FragmentLoginBinding
import com.rodyapal.mss.utils.CURRENT_GROUP_PREFERENCE
import com.rodyapal.mss.utils.CURRENT_GROUP_PREFERENCE_NAME
import com.rodyapal.mss.viewmodels.LoginViewModel

class LoginFragment : Fragment() {

    private lateinit var loginViewModel: LoginViewModel

    private var _binding: FragmentLoginBinding? = null
    private val binding get() = _binding!!

    private val loginListController by lazy { LoginListController(loginViewModel.onItemClickListener) }

    private val sharedPreferences by lazy {
        requireContext().applicationContext.getSharedPreferences(
            CURRENT_GROUP_PREFERENCE, Context.MODE_PRIVATE)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        loginViewModel = ViewModelProvider(requireActivity()).get(LoginViewModel::class.java)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding =  FragmentLoginBinding.inflate(inflater, container, false)
        if (sharedPreferences.contains(CURRENT_GROUP_PREFERENCE_NAME))
            sharedPreferences.getString(CURRENT_GROUP_PREFERENCE_NAME, null)?.let {
                loginViewModel.navigateToScheduleFragment(findNavController(), it)
            }
        binding.lfRefreshLayout.setOnRefreshListener {
            getAllGroups()
        }
        setHasOptionsMenu(true)
        getAllGroups()
        setUpRecyclerView()
        return binding.root
    }

    private fun setUpRecyclerView() {
        with(binding.lfRvGroups) {
            setController(loginListController)
            layoutManager = StaggeredGridLayoutManager(2, StaggeredGridLayoutManager.VERTICAL)
        }
    }

    private fun getAllGroups() {
        loginListController.isLoading = true
        loginViewModel.getAllGroups()
        loginViewModel.groups.observe(viewLifecycleOwner) { names ->
            loginListController.data = names
            binding.lfShimmerLayout.stopShimmer()
            binding.lfShimmerLayout.hideShimmer()
        }
        binding.lfRefreshLayout.isRefreshing = false
    }

    override fun onCreateOptionsMenu(menu: Menu, inflater: MenuInflater) {
        inflater.inflate(R.menu.login_fragment_menu, menu)
        val searchView = menu.findItem(R.id.lf_menu_search).actionView as SearchView
        searchView.isSubmitButtonEnabled = true
        searchView.setOnQueryTextListener(loginViewModel.onQueryTextListener)
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        when (item.itemId) {
            R.id.lf_menu_order_by_suffix -> loginViewModel.sortBySuffix()
            R.id.lf_menu_order_by_year -> loginViewModel.getAllGroups() //TODO: fix sortByYear()
        }
        return super.onOptionsItemSelected(item)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}