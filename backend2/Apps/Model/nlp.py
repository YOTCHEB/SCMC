from langchain_openai import ChatOpenAI
from Apps.Model.cofing import Secret
from langchain_core.runnables import Runnable

class Model(Runnable):
    def __init__(self, model_name: str = 'AI21/j2-ultra-instruct'):
        self.model_name = model_name
        self.url = "https://openrouter.ai/api/v1"
        self.temperature = 0.7
        self.max_tokens = 1024
        self.api_key = Secret()
        self.default_headers = {
            "HTTP-Referer": "http://localhost:5174",
            "X-Title": "SCMC-Project",
            "Content-Type": "application/json"
        }

    def __get_model__(self) -> ChatOpenAI:
        return ChatOpenAI(
            model=self.model_name,
            base_url=self.url,
            api_key=self.api_key,
            temperature=self.temperature,
            max_tokens=self.max_tokens,
            default_headers=self.default_headers
        )

    def ask(self, prompt) -> str:
        model = self.__get_model__()
        response = model.invoke(prompt)
        return getattr(response, "content", str(response))

    def invoke(self, input, config=None):
        model = self.__get_model__()
        return model.invoke(input, config=config)

MCMC = Model()