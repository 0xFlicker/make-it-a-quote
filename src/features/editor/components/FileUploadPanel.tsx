import { FC } from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";
import UploadIcon from "@mui/icons-material/Upload";
import Dialog from "@mui/material/Dialog";
import { useDropzone } from "react-dropzone";

type Props = {
  onFileUpload?: (file: File) => void;
};

export const FileUploadPanel: FC<Props> = ({ onFileUpload }) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: ([file]) => {
      if (onFileUpload) {
        onFileUpload(file);
      }
    },
  });

  return (
    <Card {...getRootProps()}>
      <CardActionArea sx={{ height: 400 }}>
        <CardHeader
          title="Import"
          avatar={<UploadIcon />}
          sx={{ textAlign: "center" }}
        />
        <CardContent>
          <input {...getInputProps()} />
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export const FileUploadDialog: FC<
  Props & {
    open: boolean;
    onClose: () => void;
  }
> = ({ onFileUpload, open, onClose }) => {
  const handleFileUpload = (file: File) => {
    onFileUpload?.(file);
    onClose();
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          p: 4,
          width: "400px",
        },
      }}
    >
      <FileUploadPanel onFileUpload={handleFileUpload} />
    </Dialog>
  );
};
