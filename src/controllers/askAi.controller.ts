import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const askAI = async (req: Request, res: Response) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: "Pergunta não informada" });
    }

    try {
        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "Chave da API não encontrada" });
        }

        const response = await axios.post(
            "https://api.deepseek.com/v1/chat/completions",
            {
                model: "deepseek-chat",
                messages: [{ role: "user", content: question }],
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
            }
        );
        
        console.log(response)
        res.json({ answer: response.data.choices[0].message.content });
    } catch (error: any) {
        console.error("Erro ao consultar a IA:", error);

        res.status(500).json({
            error: "Erro ao processar a dúvida",
            details: error.response?.data || error.message,
        });
    }
};
