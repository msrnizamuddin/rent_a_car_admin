"use client";

import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import FormLabel from "./FormLabel";

const baseClass =
  "w-full pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-black placeholder:text-slate-300 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition";

type BaseFieldProps = {
  label: string;
  icon: React.ElementType;
};

type InputFieldProps = BaseFieldProps &
  InputHTMLAttributes<HTMLInputElement> & {
    as?: "input";
  };

type TextareaFieldProps = BaseFieldProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: "textarea";
  };

type FieldProps = InputFieldProps | TextareaFieldProps;

export default function FormField({ label, icon: Icon, ...props }: FieldProps) {
  const isTextarea = props.as === "textarea";

  return (
    <div>
      <FormLabel>{label}</FormLabel>
      <div className="relative">
        <Icon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
        {isTextarea ? (
          <textarea
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
            className={`${baseClass} py-3 resize-none`}
          />
        ) : (
          <input
            {...(props as InputHTMLAttributes<HTMLInputElement>)}
            className={`${baseClass} h-11`}
          />
        )}
      </div>
    </div>
  );
}
