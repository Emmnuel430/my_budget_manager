"use client";

import { useUser } from "@clerk/nextjs";
import React, { useCallback, useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import EmojiPicker from "emoji-picker-react";
import { addBudget, getBudgetsByUser } from "../actions";
import Notification from "../components/Notification";
import { Budget } from "@/type";
import Link from "next/link";
import BudgetItem from "../components/BudgetItem";
import { Landmark } from "lucide-react";

export default function Page() {
  const { user } = useUser();
  const [budgetName, setBudgetName] = useState<string>("");
  const [budgetAmount, setBudgetAmount] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");

  const [budgets, setBudgets] = useState<Budget[]>([]);

  const [notifType, setNotifType] = useState<string>("success");
  const [notification, setNotification] = useState<string>("");
  const closeNotification = () => {
    setNotification("");
  };

  const handleEmojiSelect = (emojiObject: { emoji: string }) => {
    setSelectedEmoji(emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const fetchBudgets = useCallback(async () => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) return;

    try {
      const userBudgets = await getBudgetsByUser(email);
      setBudgets(userBudgets);
    } catch (error) {
      setNotifType("error");
      setNotification(`Erreur lors de la récupération des budgets: ${error}`);
    }
  }, [user?.primaryEmailAddress?.emailAddress]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleAddBudget = async () => {
    try {
      const amount = parseFloat(budgetAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Le montant doit être un nombre positif.");
      }

      await addBudget(
        user?.primaryEmailAddress?.emailAddress as string,
        budgetName,
        amount,
        selectedEmoji
      );

      await fetchBudgets();

      const modal = document.getElementById("my_modal") as HTMLDialogElement;
      if (modal) {
        modal.close();
      }

      setNotifType("success");
      setNotification("Nouveau budget créé avec succès.");
      setBudgetName("");
      setBudgetAmount("");
      setSelectedEmoji("");
      setShowEmojiPicker(false);
    } catch (error) {
      setNotification(`Erreur : ${error}`);
      setNotifType("error");
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

      <div className="flex justify-end">
        <button
          className="btn mb-4"
          onClick={() =>
            (
              document.getElementById("my_modal") as HTMLDialogElement
            ).showModal()
          }
        >
          Nouveau Budget
          <Landmark className="w-4" />
        </button>
      </div>

      <dialog id="my_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">Création d&apos;un budget</h3>
          <p className="py-4 text-center">Ajoutez un nouveau budget </p>
          <div className="w-full flex flex-col">
            <input
              type="text"
              value={budgetName}
              placeholder="Nom du budget"
              onChange={(e) => setBudgetName(e.target.value)}
              className="w-full input input-bordered mb-3"
              required
            />

            <input
              type="number"
              min={0}
              value={budgetAmount}
              placeholder="Montant"
              onChange={(e) => setBudgetAmount(e.target.value)}
              className="w-full input input-bordered mb-3"
              required
            />

            <button
              className="btn mb-3"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              {selectedEmoji || "Selectionnez un emoji ✔"}
            </button>

            {showEmojiPicker && (
              <div className="flex justify-center items-center my-4">
                <EmojiPicker onEmojiClick={handleEmojiSelect} />
              </div>
            )}

            <button
              onClick={handleAddBudget}
              className="btn btn-accent"
              disabled={!budgetName || !budgetAmount}
            >
              Ajouter Budget
            </button>
          </div>
        </div>
      </dialog>

      <ul className="grid md:grid-cols-3 gap-4">
        {budgets.map((budget) => (
          <Link href={`/manage/${budget.id}`} key={budget.id}>
            <BudgetItem budget={budget} enableHover={1}></BudgetItem>
          </Link>
        ))}
      </ul>
    </Wrapper>
  );
}
