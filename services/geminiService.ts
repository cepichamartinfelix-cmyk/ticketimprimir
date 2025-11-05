
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from '../types';

// Ensure you have your API key in environment variables
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY for Gemini is not set. Promotional features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

interface PromotionalHighlight {
  productId: string;
  reason: string;
}

export const getPromotionalProductHighlight = async (
  categoryName: string,
  products: Product[]
): Promise<PromotionalHighlight | null> => {
  if (!API_KEY) {
    // Fallback if API key is not available
    const promotionalProduct = products[Math.floor(Math.random() * products.length)];
    return {
        productId: promotionalProduct.id,
        reason: "¡Nuestra recomendación especial para ti!"
    };
  }

  const productList = products.map(p => `ID: ${p.id}, Nombre: ${p.name}, Precio: $${p.price.toFixed(2)}`).join('\n');
  const prompt = `
    Eres un experto en marketing para una cafetería.
    Tu tarea es seleccionar UN producto de la siguiente lista de la categoría "${categoryName}" para destacarlo como "Producto Premio/Promocional".
    Debes elegir el producto que suene más atractivo o interesante para los clientes.
    Luego, escribe una razón corta y llamativa (máximo 10 palabras) para promocionarlo.

    Lista de productos:
    ${productList}

    Devuelve tu respuesta en formato JSON.
  `;
  
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productId: {
                type: Type.STRING,
                description: "El ID del producto seleccionado."
              },
              reason: {
                type: Type.STRING,
                description: "La razón promocional corta y llamativa."
              }
            }
          }
        }
    });

    const text = response.text.trim();
    const result = JSON.parse(text);

    if (result.productId && result.reason && products.some(p => p.id === result.productId)) {
        return result as PromotionalHighlight;
    }
    return null;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Fallback on API error
    const promotionalProduct = products[Math.floor(Math.random() * products.length)];
    return {
        productId: promotionalProduct.id,
        reason: "¡Oferta especial por tiempo limitado!"
    };
  }
};
