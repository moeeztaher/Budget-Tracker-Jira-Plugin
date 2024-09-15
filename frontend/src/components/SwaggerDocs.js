import React, { useEffect, useRef } from 'react';
import SwaggerUIBundle from 'swagger-ui-dist/swagger-ui-bundle';
import 'swagger-ui-dist/swagger-ui.css';

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Budget Tracker API',
    version: '1.0.0',
    description: 'API for Budget Tracker Jira Plugin',
  },
  servers: [
    {
      url: 'http://localhost:2990/jira/rest/budget/1.0',
      description: 'Local development server'
    }
  ],
  paths: {
    '/budget': {
      get: {
        summary: 'Get all budgets',
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Budget' }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create a new budget',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Budget' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Budget' }
              }
            }
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/budget/{id}': {
      delete: {
        summary: 'Delete a budget',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Successful response'
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      },
      put: {
        summary: 'Update a budget',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Budget' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Budget' }
              }
            }
          },
          '404': {
            description: 'Budget not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/budget/expenses/all/{projectKey}': {
      get: {
        summary: 'Get project expenses',
        parameters: [
          {
            name: 'projectKey',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Expense' }
                }
              }
            }
          }
        }
      }
    },
    '/budget/remaining/{projectKey}': {
      get: {
        summary: 'Get remaining budget',
        parameters: [
          {
            name: 'projectKey',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'number'
                }
              }
            }
          }
        }
      }
    },
    '/budget/set': {
      post: {
        summary: 'Set project budget',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  projectKey: { type: 'string' },
                  totalBudget: { type: 'number' }
                },
                required: ['projectKey', 'totalBudget']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Successful response'
          }
        }
      }
    },
    '/budget/overview/{projectKey}': {
      get: {
        summary: 'Get budget overview for a project',
        parameters: [
          {
            name: 'projectKey',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BudgetOverview' }
              }
            }
          }
        }
      }
    },
    '/budget/expenses/by-category/{projectKey}': {
      get: {
        summary: 'Get expenses by category',
        parameters: [
          {
            name: 'projectKey',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      category: { type: 'string' },
                      amount: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/budget/expenses/by-phase/{projectKey}': {
      get: {
        summary: 'Get expenses by phase',
        parameters: [
          {
            name: 'projectKey',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      phase: { type: 'string' },
                      amount: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/budget/cumulative-expenses/{projectKey}': {
      get: {
        summary: 'Get cumulative expenses',
        parameters: [
          {
            name: 'projectKey',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      date: { type: 'string', format: 'date' },
                      amount: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/budget/expenses/{issueKey}': {
      get: {
        summary: 'Get expenses for an issue',
        parameters: [
          {
            name: 'issueKey',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Budget' }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Budget: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          budgetName: { type: 'string' },
          totalBudget: { type: 'number' },
          projectKey: { type: 'string' }
        }
      },
      BudgetOverview: {
        type: 'object',
        properties: {
          totalBudget: { type: 'number' },
          totalExpenses: { type: 'number' },
          remainingBudget: { type: 'number' }
        }
      },
      Expense: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          amount: { type: 'number' },
          description: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          category: { type: 'string' },
          phase: { type: 'string' }
        }
      }
    }
  }
};

const SwaggerDocs = () => {
  const swaggerUIRef = useRef(null);

  useEffect(() => {
    const ui = SwaggerUIBundle({
      spec: swaggerSpec,
      dom_id: '#swagger-ui',
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.SwaggerUIStandalonePreset
      ],
      layout: "BaseLayout",
      deepLinking: true,
    });

    return () => {
      ui.unmount();
    };
  }, []);

  return <div id="swagger-ui" ref={swaggerUIRef} />;
};

export default SwaggerDocs;