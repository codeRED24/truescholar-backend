
export const HANDLES_INDEX_NAME = 'truescholar_handles';

export const HANDLES_INDEX_MAPPING = {
  settings: {
    analysis: {
      analyzer: {
        handle_autocomplete: {
          type: 'custom',
          tokenizer: 'handle_ngram',
          filter: ['lowercase'],
        },
        handle_search: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase'],
        },
      },
      tokenizer: {
        handle_ngram: {
          type: 'edge_ngram',
          min_gram: 1,
          max_gram: 20,
          token_chars: ['letter', 'digit', 'custom'],
          custom_token_chars: ['_'],
        },
      },
    },
  },
  mappings: {
    properties: {
      handle: {
        type: 'text',
        analyzer: 'handle_autocomplete',
        search_analyzer: 'handle_search',
        fields: {
          keyword: {
            type: 'keyword',
            ignore_above: 256
          }
        }
      },
      displayName: {
        type: 'text',
        analyzer: 'handle_autocomplete',
        search_analyzer: 'handle_search',
      },
      entityType: { type: 'keyword' },
      entityId: { type: 'keyword' },
      image: { type: 'keyword', index: false },
    },
  },
};
