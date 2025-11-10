"use client";
import {
  addTransactionToBudget,
  deleteBudget,
  deleteTransaction,
  getTrasactionsByBudgetId,
} from "@/app/actions";
import BudgetItem from "@/app/components/BudgetItem";
import Wrapper from "@/app/components/Wrapper";
import { Budget } from "@/type";
import { useEffect, useState } from "react";
import Notification from "@/app/components/Notification";
import { Send, Trash } from "lucide-react";
import { redirect } from "next/navigation";

export default function Page({
  params,
}: {
  params: Promise<{ budgetId: string }>;
}) {
  const [budgetId, setBudgetId] = useState<string>("");
  const [budget, setBudget] = useState<Budget>();
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [notifType, setNotifType] = useState<string>("success");

  const [notification, setNotification] = useState<string>("");
  const closeNotification = () => {
    setNotification("");
  };

  async function fetchBudgetData(budgetId: string) {
    try {
      if (budgetId) {
        const budgetData = await getTrasactionsByBudgetId(budgetId);
        setBudget(budgetData);
      }
    } catch (error) {
      setNotifType("error");
      setNotification(
        "Erreur lors de la récupération du budget et des transactions: " + error
      );
      console.error(
        "Erreur lors de la récupération du budget et des transactions:",
        error
      );
    }
  }

  useEffect(() => {
    const getId = async () => {
      const resolvedParams = await params;
      setBudgetId(resolvedParams.budgetId);
      fetchBudgetData(resolvedParams.budgetId);
    };
    getId();
  }, [params]);

  const handleAddTransaction = async () => {
    if (!amount || !description) {
      setNotification("Veuillez remplir tous les champs.");
      setNotifType("info");
      return;
    }

    try {
      const amountNumber = parseFloat(amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        throw new Error("Le montant doit être un nombre positif.");
      }

      await addTransactionToBudget(budgetId, amountNumber, description);

      setNotification(`Transaction ajoutée avec succès`);
      setNotifType("success");
      fetchBudgetData(budgetId);
      setAmount("");
      setDescription("");
    } catch (error) {
      setNotification(`Vous avez dépassé votre budget`);
      setNotifType("error");
      console.error("Erreur lors de l'ajout de la transaction:", error);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cette transaction ?"
    );
    if (confirmed) {
      try {
        await deleteTransaction(transactionId);
        fetchBudgetData(budgetId);
        setNotifType("success");
        setNotification("Dépense supprimée");
      } catch (error) {
        console.error("Erreur lors de la suppression du budget:", error);
      }
    }
  };

  const handleDeleteBudget = async () => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce budget et toutes ses transactions associées ?"
    );
    if (confirmed) {
      try {
        await deleteBudget(budgetId);
      } catch (error) {
        console.error("Erreur lors de la suppression du budget:", error);
      }
      redirect("/budjets");
    }
  };

  return (
    <Wrapper>
      {notification && (
        <Notification
          message={notification}
          onclose={closeNotification}
          type={notifType}
        ></Notification>
      )}
      {budget && (
        <div className="flex lg:flex-row flex-col">
          <div className="lg:w-1/3">
            <BudgetItem budget={budget} enableHover={0} />
            <div className="flex justify-end">
              <button
                onClick={() => handleDeleteBudget()}
                className="btn mt-4 bg-error text-white"
              >
                Supprimer le budget
              </button>
            </div>
            <div className="space-y-4 flex flex-col mt-4">
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                required
                className="input input-bordered w-full"
              />

              <input
                type="number"
                id="amount"
                placeholder="Montant"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className=" input input-bordered w-full"
              />

              <button onClick={handleAddTransaction} className="btn">
                Ajouter votre dépense
              </button>
            </div>
          </div>

          {budget?.transactions && budget.transactions.length > 0 ? (
            <div className="overflow-x-auto lg:mt-0 mt-4 lg:w-2/3 ml-4">
              <table className="table table-zebra">
                {/* head */}
                <thead>
                  <tr>
                    <th></th>
                    <th>Montant</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {budget?.transactions?.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="text-lg lg:text-3xl">
                        {transaction.emoji || "💸"}
                      </td>
                      <td>
                        <div className="badge badge-accent badge-xs lg:badge-sm">
                          - {transaction.amount} €
                        </div>
                      </td>
                      <td>{transaction.description}</td>
                      <td>
                        {transaction.createdAt.toLocaleDateString("fr-FR")}
                      </td>
                      <td>
                        {transaction.createdAt.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            handleDeleteTransaction(transaction.id)
                          }
                          className="btn btn-sm"
                        >
                          <Trash className="w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="lg:w-2/3 mt-10 lg:ml-4 flex items-center justify-center">
              <Send strokeWidth={1.5} className="w-8 h-8 text-accent" />
              <span className="text-gray-500 ml-2">Aucune transaction.</span>
            </div>
          )}
        </div>
      )}
    </Wrapper>
  );
}
