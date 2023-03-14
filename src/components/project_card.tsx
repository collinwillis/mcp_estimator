import { CheckIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Center,
  HStack,
  List,
  ListIcon,
  ListItem,
  Stack,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

interface ProjectCardProps {
  name: string;
  id: string;
}
function ProjectCard({ name, id }: ProjectCardProps) {
  const navigate = useNavigate();
  return (
    <Box
      mb={4}
      shadow="base"
      borderWidth="1px"
      alignSelf={{ base: "center", lg: "flex-start" }}
      borderColor={useColorModeValue("gray.200", "gray.500")}
      borderRadius={"xl"}
    >
      <Box py={4} px={12}>
        <Text fontWeight="500" fontSize="2xl">
          {name}
        </Text>
        <HStack justifyContent="center">
          <Text fontSize="3xl" fontWeight="600">
            $
          </Text>
          <Text fontSize="5xl" fontWeight="900">
            349
          </Text>
        </HStack>
      </Box>
      <VStack
        bg={useColorModeValue("gray.50", "gray.700")}
        py={4}
        borderBottomRadius={"xl"}
      >
        <List spacing={3} textAlign="start" px={12}>
          <ListItem>
            <ListIcon as={CheckIcon} color="green.500" />
            unlimited build minutes
          </ListItem>
          <ListItem>
            <ListIcon as={CheckIcon} color="green.500" />
            Lorem, ipsum dolor.
          </ListItem>
          <ListItem>
            <ListIcon as={CheckIcon} color="green.500" />
            5TB Lorem, ipsum dolor.
          </ListItem>
        </List>
        <Box w="80%" pt={7}>
          <Button
            w="full"
            colorScheme="red"
            variant="outline"
            onClick={() => {
              navigate(`/proposal/${id}`);
            }}
          >
            View Proposal
          </Button>
        </Box>
      </VStack>
    </Box>
  );
}

export default ProjectCard;
