import {
  Button,
  Flex,
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  useToast,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { useLogin } from "./api/auth";

import "./App.css";

export const App = () => {
  const { mutate: login } = useLogin();
  const toast = useToast();

  const formik = useFormik({
    initialValues: { username: "", password: "" },
    onSubmit: (values) => {
      login(values, {
        onSettled: (res) => {
          if (res.error) {
            toast({
              title: "Login failed",
              description: res.error,
              status: "error",
              duration: 3000,
              isClosable: true,
              position: "top",
            });
          }

          if (res.ok) {
            toast({
              title: "Login success",
              status: "success",
              duration: 3000,
              isClosable: true,
              position: "top",
            });
          }
        },
      });
    },
  });

  return (
    <Flex bg="gray.100" align="center" justify="center" h="100vh">
      <Box bg="white" p={6} rounded="md">
        <form onSubmit={formik.handleSubmit}>
          <VStack spacing={4} align="flex-start">
            <FormControl>
              <FormLabel htmlFor="username">Username</FormLabel>
              <Input
                id="username"
                name="username"
                variant="filled"
                onChange={formik.handleChange}
                value={formik.values.username}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input
                id="password"
                name="password"
                type="password"
                variant="filled"
                onChange={formik.handleChange}
                value={formik.values.password}
              />
            </FormControl>
            <Flex align="center" justify="center" w="100%" gap={1}>
              <Button type="submit" colorScheme="purple" width="full">
                Login
              </Button>
              <Button type="submit" colorScheme="purple" width="full">
                Register
              </Button>
            </Flex>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
};
