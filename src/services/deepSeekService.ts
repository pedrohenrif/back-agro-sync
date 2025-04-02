import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_URL = "https://api.deepseek.com/v1/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY;

export async function askDeepSeek(question: string) {
    try {
        const response = await axios.post(
            API_URL,
            {
                model: "deepseek-chat", // Ajuste conforme o modelo suportado
                messages: [{ role: "user", content: question }],
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_KEY}`,
                },
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Erro ao consultar a IA:", error);
        return "Houve um problema ao processar sua dúvida.";
    }
}
