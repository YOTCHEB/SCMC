import os

def Secret() -> str:
    """
    Read the API key from a local `api.txt` file in the same directory.
    """
    api_file_path = os.path.join(os.path.dirname(__file__), "api.txt")
    
    try:
        with open(api_file_path, 'r') as file:
            api_key = file.read().strip()
            if not api_key:
                raise ValueError("api.txt is empty. Please add a valid API key.")
            return api_key
    except FileNotFoundError:
        raise ValueError(f"api.txt not found at {api_file_path}")
    except Exception as e:
        raise ValueError(f"Error reading API key: {str(e)}")


def Link_URL_EMBEDDING() -> str:
    """
    Returns the embedding model name.
    """
    return "embedding-3"


def Link_URL() -> str:
    """
    Returns the base URL of the LLM API.
    """
    return "https://open.bigmodel.cn/api/paas/v4"
