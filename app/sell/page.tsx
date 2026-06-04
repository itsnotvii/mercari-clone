"use client";

import Link from "next/link";
import { useState } from "react";

const categories = ["Electronics", "Sneakers", "Clothing", "Gaming", "Home", "Bags"]
const conditions = ["New", "Like New", "Good", "Fair"];

export default function SellPage() {
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({
        title: "",
        price: "",
        category: "",
        condition: "",
        description: "",
    });

    
}