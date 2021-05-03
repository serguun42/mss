const CONFIG = {
	"API": {
		"BASE_URL": (process.env.NODE_ENV === "development" ? "https://localhost:5056/api" : "https://mirea.xyz/api"),
		"VERSION": "v1.1"
	}
}

export default CONFIG;
