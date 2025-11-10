"use server";

import prisma from "@/lib/prisma";
// import { Budget, Transaction } from "@/type";

// Add user if not exists
export async function checkAndAddUser(email: string | undefined) {
  if (!email) return;
  try {
    // Verifie si l'user existe deja dans la base de donnees
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // S'il n'existe pas, l'ajoute
    if (!existingUser) {
      await prisma.user.create({
        data: { email },
      });
      console.log("Nouvel utilisateur ajouté dans la base de données");
    } else {
      // Sinon, ne rien faire
      return;
    }
  } catch (error) {
    console.error("Erreur lors de la vérification de l'utilisateur:", error);
  }
}

// Add Budget
export async function addBudget(
  email: string,
  name: string,
  amount: number,
  selectedEmoji: string
) {
  try {
    // Recupere l'user par son email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Vérifie si un budget avec le même nom existe déjà pour cet utilisateur
    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId: user.id,
        name,
      },
    });

    if (existingBudget) {
      throw new Error("Un budget avec ce nom existe déjà");
    }

    // Crée un nouveau budget associé à l'utilisateur
    await prisma.budget.create({
      data: {
        name,
        amount,
        emoji: selectedEmoji,
        userId: user.id,
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du budget:", error);
    throw error;
  }
}

// Get Budgets by User Email
export async function getBudgetsByUser(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        budgets: {
          include: {
            transactions: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    return user.budgets;
  } catch (error) {
    console.error("Erreur lors de la récupération des budgets:", error);
    throw error;
  }
}

// Get buget and all of these transactions by Budget Id
export async function getTrasactionsByBudgetId(budgetId: string) {
  try {
    const budget = await prisma.budget.findUnique({
      where: {
        id: budgetId,
      },
      include: {
        transactions: true,
      },
    });
    if (!budget) {
      throw new Error("Budget non trouvé.");
    }

    return budget;
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions:", error);
    throw error;
  }
}

// Add a transaction to a budget
export async function addTransactionToBudget(
  budgetId: string,
  amount: number,
  description: string
) {
  try {
    // Find the budget by its ID
    const budget = await prisma.budget.findUnique({
      where: {
        id: budgetId,
      },
      include: {
        transactions: true,
      },
    });

    if (!budget) {
      throw new Error("Budget non trouvé.");
    }

    // Calculate the total amount of existing transactions
    const totalTransactions = budget.transactions.reduce((sum, transaction) => {
      return sum + transaction.amount;
    }, 0);

    const totalWithNewTransaction = totalTransactions + amount;

    // Check if adding the new transaction exceeds the budget amount
    if (totalWithNewTransaction > budget.amount) {
      throw new Error(
        "Le montant total des transactions dépasse le montant du budget."
      );
    }

    await prisma.transaction.create({
      data: {
        amount,
        description,
        emoji: budget.emoji,
        budget: {
          connect: {
            id: budget.id,
          },
        },
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la transaction:", error);
    throw error;
  }
}

export const deleteBudget = async (budgetId: string) => {
  try {
    await prisma.transaction.deleteMany({
      where: { budgetId },
    });

    await prisma.budget.delete({
      where: {
        id: budgetId,
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression du budget et de ses transactions associées: ",
      error
    );
    throw error;
  }
};

export async function deleteTransaction(transactionId: string) {
  try {
    // console.log(" id de la transact", transactionId);
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
    });

    if (!transaction) {
      throw new Error("Transaction non trouvée.");
    }

    await prisma.transaction.delete({
      where: {
        id: transactionId,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la transaction:", error);
    throw error;
  }
}

export async function getTransactionsByEmailAndPeriod(
  email: string,
  period: string
) {
  try {
    const now = new Date();

    const dateLimit = new Date(now);
    switch (period) {
      case "last30":
        dateLimit.setMonth(now.getMonth() - 1);
        break;
      case "last90":
        dateLimit.setDate(now.getDate() - 90);
        break;
      case "last7":
        dateLimit.setDate(now.getDate() - 7);
        break;
      case "last365":
        dateLimit.setFullYear(now.getFullYear() - 1);
        break;
      default:
        throw new Error("Période invalide.");
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        budgets: {
          include: {
            transactions: {
              where: {
                createdAt: {
                  gte: dateLimit,
                },
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé.");
    }

    const transactions = user.budgets.flatMap((budjet) =>
      budjet.transactions.map((transaction) => ({
        ...transaction,
        budgetName: budjet.name,
        budgetId: budjet.id,
      }))
    );

    return transactions;
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions:", error);
    throw error;
  }
}

//dashboard
// Total transaction amount
export async function getTotalTransactionAmount(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        budgets: {
          include: {
            transactions: true,
          },
        },
      },
    });

    if (!user) throw new Error("Utilisateur non trouvé");

    // ----------Autres méthodes d'agrégation (meilleure performance)----------
    // // On demande à la DB la somme des montants des transactions liées aux budgets de cet utilisateur
    // const agg = await prisma.transaction.aggregate({
    //   _sum: { amount: true },
    //   where: {
    //     budget: {
    //       userId: user.id,
    //     },
    //   },
    // });

    // // agg._sum.amount peut être null si aucune transaction trouvée
    // return agg._sum.amount ?? 0;

    const totalAmount = user.budgets.reduce((sum, budget) => {
      return (
        sum +
        budget.transactions.reduce(
          (transacSum, transaction) => transacSum + transaction.amount,
          0
        )
      );
    }, 0);

    return totalAmount;
  } catch (error) {
    console.error(
      "Erreur lors du calcul du montant total des transactions:",
      error
    );
    throw error;
  }
}

// Total transaction count
export async function getTotalTransactionCount(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        budgets: {
          include: {
            transactions: true,
          },
        },
      },
    });

    if (!user) throw new Error("Utilisateur non trouvé");

    const totalCount = user.budgets.reduce((count, budget) => {
      return count + budget.transactions.length;
    }, 0);

    return totalCount;
  } catch (error) {
    console.error("Erreur lors du comptage des transactions:", error);
    throw error;
  }
}

// Reached budgets ratio
export async function getReachedBudgets(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        budgets: {
          include: {
            transactions: true,
          },
        },
      },
    });

    if (!user) throw new Error("Utilisateur non trouvé");

    const totalBudgets = user.budgets.length;
    const reachedBudgets = user.budgets.filter((budget) => {
      const totalTransactionsAmount = budget.transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );
      return totalTransactionsAmount >= budget.amount;
    }).length;

    return `${reachedBudgets}/${totalBudgets}`;
  } catch (error) {
    console.error("Erreur lors du calcul des budgets atteints:", error);
    throw error;
  }
}

export async function getUserBudgetData(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { budgets: { include: { transactions: true } } },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé.");
    }

    const data = user.budgets.map((budget) => {
      const totalTransactionsAmount = budget.transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );
      return {
        budgetName: budget.name,
        totalBudgetAmount: budget.amount,
        totalTransactionsAmount,
      };
    });

    return data;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données budgétaires:",
      error
    );
    throw error;
  }
}

export const getLastTransactions = async (email: string) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        budget: {
          user: {
            email: email,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
        budget: {
          select: {
            name: true,
          },
        },
      },
    });

    const transactionsWithBudgetName = transactions.map((transaction) => ({
      ...transaction,
      budgetName: transaction.budget?.name || "N/A",
    }));

    return transactionsWithBudgetName;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des dernières transactions: ",
      error
    );
    throw error;
  }
};

export const getLastBudgets = async (email: string) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: {
        user: {
          email,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
      include: {
        transactions: true,
      },
    });

    return budgets;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des derniers budgets: ",
      error
    );
    throw error;
  }
};
