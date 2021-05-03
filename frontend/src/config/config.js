const CONFIG = {
	"API": {
		"BASE_URL": (process.env.NODE_ENV === "development" ? "https://localhost:5056/api" : "https://mirea.xyz/api"),
		"VERSION": "v1.1",
		"METHODS": {
			"groups": {
				"queries": {
					"getAll": "Get all groups. Sends names and suffixes",
					"get": "`?get=<GROUP_NAME>` – select group(s) with name",
					"suffix": "`&suffix=<GROUP_SUFFIX>` – specify group with its suffix if necessary"
				},
				"methods": {}
			}
		}
	}
}

export default CONFIG;
