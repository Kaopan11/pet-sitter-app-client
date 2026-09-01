"use client";

/**
 * ฟอร์มบัญชีรับเงิน — ticket T03
 * Flow: กรอกฟอร์ม → Update → Modal → upload รูป (ถ้าใหม่) → PUT → กลับ dashboard
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LoadingState from "@/components/LoadingState";
import BookBankImageUpload from "@/components/sitter/payout/BookBankImageUpload";
import PayoutConfirmModal from "@/components/sitter/payout/PayoutConfirmModal";
import {
  formatBankAccountNumberInput,
  stripBankAccountDigits,
  validatePayoutBankAccountFields,
  BANK_ACCOUNT_INPUT_MAX_LENGTH,
  ACCOUNT_NAME_MAX_LENGTH,
} from "@/lib/validatePayoutBankAccount";
import {
  getBanks,
  getMyPayoutBankAccount,
  normalizePayoutError,
  PAYOUT_ERROR_ACTION,
  updateMyPayoutBankAccount,
  uploadBookBankImage,
} from "@/lib/api/payout";

const initialForm = {
  bankCode: "",
  accountNumber: "",
  accountName: "",
};

/** เลขบัญชีจาก BE ที่ mask แล้วไม่ควร pre-fill */
function isMaskedAccountNumber(value) {
  const text = String(value ?? "").trim();
  return !text || text.includes("*");
}

export default function BankAccountPage() {
  const router = useRouter();
  const [banks, setBanks] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [bookBankImageUrl, setBookBankImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  const loadPageData = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const [bankList, account] = await Promise.all([
        getBanks(),
        getMyPayoutBankAccount(),
      ]);

      setBanks(bankList);

      if (account) {
        setForm({
          bankCode: account.bankCode ?? "",
          accountNumber: isMaskedAccountNumber(account.accountNumberMasked)
            ? ""
            : formatBankAccountNumberInput(
                String(account.accountNumberMasked ?? ""),
              ),
          accountName: account.accountName ?? "",
        });
        setBookBankImageUrl(account.bookBankImageUrl ?? "");
        setPreviewUrl(account.bookBankImageUrl ?? "");
      }
    } catch (err) {
      const { action, message } = normalizePayoutError(err);
      if (action === PAYOUT_ERROR_ACTION.LOGIN) {
        router.replace("/login");
        return;
      }
      setPageError(message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-only bank account load
    void loadPageData();
  }, [loadPageData]);

  function handleFieldChange(event) {
    const { name, value } = event.target;

    if (name === "accountNumber") {
      setForm((current) => ({
        ...current,
        accountNumber: formatBankAccountNumberInput(value),
      }));
      setErrors((current) => ({ ...current, accountNumber: "" }));
      return;
    }

    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function handleBankChange(value) {
    setForm((current) => ({ ...current, bankCode: value }));
    setErrors((current) => ({ ...current, bankCode: "" }));
  }

  /** เลือกรูปใหม่ — เก็บไฟล์ไว้ upload หลัง modal ยืนยัน */
  function handleBookBankSelect(file, fieldErrors) {
    if (fieldErrors?.bookBankImage) {
      setErrors((current) => ({
        ...current,
        bookBankImage: fieldErrors.bookBankImage,
      }));
      return;
    }

    setErrors((current) => ({ ...current, bookBankImage: "" }));

    if (!file) return;

    setImageFile(file);
    setPreviewUrl((current) => {
      if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  }

  function getInputClassName(field) {
    return `input ${errors[field] ? "input-error" : ""}`;
  }

  /** validate ก่อนเปิด modal — รวมกฎ T03b */
  function validateForm() {
    const nextErrors = {};

    if (!imageFile && !bookBankImageUrl) {
      nextErrors.bookBankImage = "Book bank image is required";
    }

    Object.assign(
      nextErrors,
      validatePayoutBankAccountFields({
        accountNumber: form.accountNumber,
        accountName: form.accountName,
      }),
    );

    if (!form.bankCode) {
      nextErrors.bankCode = "Bank name is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleUpdateClick() {
    setModalError("");
    if (!validateForm()) return;
    setShowModal(true);
  }

  /** Step สุดท้าย: upload รูป (ถ้ามีไฟล์ใหม่) แล้ว PUT */
  async function handleConfirmSave() {
    setIsSubmitting(true);
    setModalError("");

    try {
      let finalImageUrl = bookBankImageUrl;

      // Step 1: อัปโหลดรูปก่อน PUT เสมอเมื่อผู้ใช้เลือกไฟล์ใหม่
      if (imageFile) {
        const uploaded = await uploadBookBankImage(imageFile);
        finalImageUrl = uploaded.url;
      }

      // Step 2: บันทึกบัญชี — ส่งเลขบัญชีแบบไม่มี dash
      await updateMyPayoutBankAccount({
        bankCode: form.bankCode,
        accountNumber: stripBankAccountDigits(form.accountNumber),
        accountName: form.accountName.trim(),
        bookBankImageUrl: finalImageUrl,
      });

      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }

      router.push("/sitter/payout");
    } catch (err) {
      const { action, message } = normalizePayoutError(err);
      if (action === PAYOUT_ERROR_ACTION.LOGIN) {
        router.replace("/login");
        return;
      }
      setModalError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <>
      <section className="flex flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/sitter/payout"
              className="flex size-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Back to payout dashboard"
            >
              <ChevronLeft className="size-6" aria-hidden="true" />
            </Link>
            <h1 className="text-h3 font-bold text-gray-900">Payout Option</h1>
          </div>

          <button
            type="button"
            className="btn btn-primary min-w-30"
            disabled={isSubmitting}
            onClick={handleUpdateClick}
          >
            Update
          </button>
        </header>

        {pageError ? (
          <div className="rounded-2xl bg-white p-8 text-center">
            <p className="text-body-2 text-red">{pageError}</p>
            <button
              type="button"
              onClick={() => loadPageData()}
              className="btn btn-primary mt-4"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 rounded-2xl bg-white px-8 py-10 pb-48 md:px-20">
            <BookBankImageUpload
              previewUrl={previewUrl}
              onFileSelect={handleBookBankSelect}
              error={errors.bookBankImage}
            />

            <div className="grid grid-cols-2 gap-x-10 gap-y-6">
              <FormField label="Bank Account Number" required error={errors.accountNumber}>
                <input
                  className={getInputClassName("accountNumber")}
                  type="text"
                  name="accountNumber"
                  value={form.accountNumber}
                  onChange={handleFieldChange}
                  placeholder="11333-45-543-444"
                  autoComplete="off"
                  inputMode="numeric"
                  maxLength={BANK_ACCOUNT_INPUT_MAX_LENGTH}
                />
              </FormField>

              <FormField
                label="Account Name"
                required
                hint="Must match the name on your book bank"
                error={errors.accountName}
              >
                <input
                  className={getInputClassName("accountName")}
                  type="text"
                  name="accountName"
                  value={form.accountName}
                  onChange={handleFieldChange}
                  autoComplete="name"
                  maxLength={ACCOUNT_NAME_MAX_LENGTH}
                />
              </FormField>
            </div>

            <div className="max-w-md">
              <FormField label="Bank Name" required error={errors.bankCode}>
                <Select value={form.bankCode || undefined} onValueChange={handleBankChange}>
                  <SelectTrigger className={errors.bankCode ? "input-error" : ""}>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent side="bottom">
                    {banks.map((bank) => (
                      <SelectItem key={bank.code} value={bank.code}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </div>
        )}
      </section>

      <PayoutConfirmModal
        open={showModal}
        onClose={() => {
          if (isSubmitting) return;
          setShowModal(false);
          setModalError("");
        }}
        onConfirm={handleConfirmSave}
        submitting={isSubmitting}
        error={modalError}
      />
    </>
  );
}

function FormField({ label, required, hint, error, className = "", children }) {
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${className}`.trim()}>
      <span className="text-body-2 text-black">
        {label}
        {required ? <span className="text-red">*</span> : null}
      </span>
      {children}
      {hint ? <p className="text-body-3 text-gray-400">{hint}</p> : null}
      {error ? <p className="text-body-3 text-red">{error}</p> : null}
    </div>
  );
}
