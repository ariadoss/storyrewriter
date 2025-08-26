import type { ModelConfig, OpenAIConfig } from '../types';

/**
 * Parse model configuration from environment variable
 * Format: model_id_1:display_name_1:system_message_1|model_id_2:display_name_2:system_message_2
 */
export function parseModelConfig(): OpenAIConfig {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  const modelsString = import.meta.env.VITE_MODELS || '';
  const defaultModel = import.meta.env.VITE_DEFAULT_MODEL || '';

  // Validate API key
  if (!apiKey) {
    throw new Error('VITE_OPENAI_API_KEY environment variable is required');
  }

  // Parse models configuration
  const models: ModelConfig[] = [];
  
  if (modelsString) {
    const modelEntries = modelsString.split('|');

    for (const entry of modelEntries) {
      // Find the last two colons to separate model_id:display_name:system_message
      // Since model IDs can contain colons, we need to be more careful
      const lastColonIndex = entry.lastIndexOf(':');
      const secondLastColonIndex = entry.lastIndexOf(':', lastColonIndex - 1);

      if (secondLastColonIndex > 0 && lastColonIndex > secondLastColonIndex) {
        const id = entry.substring(0, secondLastColonIndex).trim();
        const displayName = entry.substring(secondLastColonIndex + 1, lastColonIndex).trim();
        const systemMessage = entry.substring(lastColonIndex + 1).trim();

        if (id && displayName && systemMessage) {
          models.push({
            id,
            displayName,
            systemMessage
          });
        }
      }
    }
  }

  // Fallback to legacy configuration if no models are defined
  if (models.length === 0) {
    const legacyModel = import.meta.env.VITE_OPENAI_MODEL || '';
    const legacySystemMessage = import.meta.env.VITE_SYSTEM_MESSAGE || '';
    
    if (legacyModel && legacySystemMessage) {
      models.push({
        id: legacyModel,
        displayName: 'Default Model',
        systemMessage: legacySystemMessage
      });
    }
  }

  // Validate that we have at least one model
  if (models.length === 0) {
    throw new Error('No models configured. Please set VITE_MODELS environment variable or use legacy VITE_OPENAI_MODEL and VITE_SYSTEM_MESSAGE variables');
  }

  // Validate default model
  const finalDefaultModel = defaultModel || models[0].id;
  const defaultModelExists = models.some(model => model.id === finalDefaultModel);
  
  if (!defaultModelExists) {
    throw new Error(`Default model "${finalDefaultModel}" not found in configured models`);
  }

  return {
    apiKey,
    models,
    defaultModel: finalDefaultModel
  };
}

/**
 * Get a specific model configuration by ID
 */
export function getModelById(models: ModelConfig[], modelId: string): ModelConfig | undefined {
  return models.find(model => model.id === modelId);
}

/**
 * Get the default model configuration
 */
export function getDefaultModel(config: OpenAIConfig): ModelConfig {
  const defaultModel = getModelById(config.models, config.defaultModel);
  if (!defaultModel) {
    throw new Error(`Default model "${config.defaultModel}" not found`);
  }
  return defaultModel;
}
