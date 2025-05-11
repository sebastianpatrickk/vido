import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  editAllowedEmails,
  getAllowedEmails,
} from "../actions/auth/allowed-email";
import { AllowedEmails } from "../validations/allowed-emails";

export const allowedEmailKeys = {
  all: ["allowed-emails"] as const,
};

export const useGetAllowedEmails = () => {
  const query = useQuery({
    queryKey: allowedEmailKeys.all,
    queryFn: getAllowedEmails,
  });

  return query;
};

export const useEditAllowedEmails = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<AllowedEmails, Error, AllowedEmails>({
    mutationFn: editAllowedEmails,
    onSuccess: () => {
      toast.success("Allowed emails updated");
      queryClient.invalidateQueries({ queryKey: allowedEmailKeys.all });
    },
    onError: () => {
      toast.error("Failed to update allowed emails");
    },
  });
  return mutation;
};
