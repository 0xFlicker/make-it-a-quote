import { FC } from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";
import UploadIcon from "@mui/icons-material/Upload";
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
      <CardActionArea sx={{ height: 200 }}>
        <CardHeader
          title="Upload a file"
          subheader="Drag and drop a file here"
          avatar={<UploadIcon />}
        />
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Or click here to select a file
          </Typography>
          <input {...getInputProps()} />
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
