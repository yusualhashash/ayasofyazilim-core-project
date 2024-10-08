/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument -- TODO: we need to fix this*/
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import type { Volo_Abp_Account_ProfileDto } from "@ayasofyazilim/saas/AccountService";
import { $Volo_Abp_Account_UpdateProfileDto } from "@ayasofyazilim/saas/AccountService";
import Button from "@repo/ayasofyazilim-ui/molecules/button";
import AutoForm from "@repo/ayasofyazilim-ui/organisms/auto-form";
import { EditIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { updateUserProfileServer } from "action";
import { createZodObject } from "src/utils";

const inputs: (keyof Volo_Abp_Account_ProfileDto)[] = [
  "userName",
  "email",
  "name",
  "surname",
  "phoneNumber",
];

const form = $Volo_Abp_Account_UpdateProfileDto;
const formSchema = createZodObject(form, inputs);

export default function ProfileForm({
  user,
}: {
  user: Volo_Abp_Account_ProfileDto | undefined;
}) {
  const [userDataForm, setUserDataForm] = useState<
    Volo_Abp_Account_ProfileDto | undefined
  >(user);

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const formChanged = inputs.some((i) => userDataForm?.[i] !== user?.[i]);
    setIsSubmitDisabled(!(formChanged || imageFile !== null));
  }, [userDataForm, imageFile]);

  function onSubmit() {
    async function update() {
      try {
        if (imageFile) {
          const formData = new FormData();
          formData.append("ImageContent", imageFile);
          formData.append("type", "2");

          await fetch("/api/profile/myprofile", {
            method: "POST",
            body: formData,
          });
        }

        const profileResponse = await updateUserProfileServer(
          userDataForm as any,
        );
        if (profileResponse.status === 200) {
          toast.success("Başarılı.");
          setIsSubmitDisabled(true);
          setImageFile(null); // Reset the imageFile state
        } else {
          toast.error(profileResponse.message);
        }
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    if (isSubmitDisabled) {
      return;
    }
    setIsLoading(true);
    void update();
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setImageFile(file);
    }
  }

  return (
    <>
      <div className="basis-2/4 pt-4">
        <AutoForm
          formSchema={formSchema}
          onParsedValuesChange={(i) => {
            setUserDataForm(i);
          }}
          onSubmit={onSubmit}
          values={user}
        >
          <Button
            className=" float-right w-[120px] text-white"
            disabled={isSubmitDisabled}
            isLoading={isLoading}
          >
            Güncelle
          </Button>
        </AutoForm>
      </div>
      <div className="min-w-[100px] basis-1/4 pt-4">
        <div className="relative m-auto h-64 w-64">
          <img
            alt=""
            className="h-full w-full rounded-full border-4 border-gray-200 object-cover"
            src={selectedImage}
          />
          <div className="absolute right-0 top-0 h-8 w-8 rounded-full border border-gray-400 bg-white p-1.5">
            <Label htmlFor="picture">
              <EditIcon className="h-full w-full cursor-pointer" />
            </Label>
          </div>
        </div>
        <Input
          className="hidden"
          id="picture"
          onChange={handleImageChange}
          type="file"
        />
      </div>
    </>
  );
}
