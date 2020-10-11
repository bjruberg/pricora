import { Fragment, FunctionalComponent, h } from "preact";
import { Link } from "preact-router/match";
import { TranslateContext } from "@denysvuika/preact-translate";
import { useContext, useState } from "preact/hooks";
import cn from "classnames";
import gql from "graphql-tag";
import { map, orderBy } from "lodash";
import { useQuery, useMutation, OperationResult } from "@urql/preact";
import {
  DeleteUserMutationMutation,
  DeleteUserMutationMutationVariables,
  RestoreUserMutation,
  RestoreUserMutationVariables,
  ToggleUserAdminMutation,
  ToggleUserAdminMutationVariables,
  UsersQueryQuery,
  UsersQueryQueryVariables,
} from "./index.gql";
import Button from "../../ui/button";
import PageContainer from "../../components/PageContainer";
import { Card } from "../../components/Card";
import Switch from "../../components/Switch";
import { routes } from "../../routes";
import { useToggle } from "../../utils/useToggle";
import * as Types from "../../gql.d";

const usersQuery = gql`
  query usersQuery($deleted: Boolean!) {
    users(deleted: $deleted) {
      deletedAt
      id
      email
      firstName
      isAdmin
      lastName
    }
  }
`;

const toggleAdminMutation = gql`
  mutation toggleUserAdmin($on: Boolean!, $userId: String!) {
    toggleUserAdmin(on: $on, userId: $userId)
  }
`;

const deleteUserMutation = gql`
  mutation deleteUserMutation($userId: String!) {
    deleteUser(userId: $userId)
  }
`;

const restoreUserMutation = gql`
  mutation restoreUser($userId: String!) {
    restoreUser(userId: $userId)
  }
`;

interface UserProps {
  deleteUser: (
    arg1: DeleteUserMutationMutationVariables,
  ) => Promise<OperationResult<DeleteUserMutationMutation>>;
  refetchUsers: () => void;
  restoreUser: (
    arg1: DeleteUserMutationMutationVariables,
  ) => Promise<OperationResult<RestoreUserMutation>>;
  toggleAdminMode: (
    arg1: ToggleUserAdminMutationVariables,
  ) => Promise<OperationResult<ToggleUserAdminMutation>>;
  user: Pick<Types.User, "id" | "email" | "firstName" | "isAdmin" | "lastName">;
}

const User: FunctionalComponent<UserProps> = ({
  deleteUser,
  refetchUsers,
  restoreUser,
  toggleAdminMode,
  user,
}) => {
  const { t } = useContext(TranslateContext);
  const [wantToDelete, setWantToDelete] = useToggle(false);
  return (
    <Card
      header={
        <div className="flex">
          <div className="flex-grow">
            {user.firstName} {user.lastName}
          </div>
          <Switch
            checked={user.isAdmin}
            label={t("pages.userlist.adminmode")}
            onOff={() => {
              void toggleAdminMode({ on: false, userId: user.id }).then(refetchUsers);
            }}
            onOn={() => {
              void toggleAdminMode({ on: true, userId: user.id }).then(refetchUsers);
            }}
            suffix={user.id}
          />
        </div>
      }
    >
      {user.deletedAt ? (
        <Button
          className="mr-4"
          onClick={() => restoreUser({ userId: user.id }).then(refetchUsers)}
          variant="secondary"
        >
          {t("actions.restore")}
        </Button>
      ) : (
        <Fragment>
          <Button className="mr-4" onClick={setWantToDelete} variant="dangerous">
            {t("actions.delete")}
          </Button>
          {wantToDelete ? (
            <Button
              onClick={() => deleteUser({ userId: user.id }).then(refetchUsers)}
              variant="dangerous"
            >
              {t("actions.really_delete")}
            </Button>
          ) : null}
        </Fragment>
      )}
    </Card>
  );
};

const activeTabClasses = "border-l border-t border-r rounded-t text-blue-800";
const tabClasses = "bg-white inline-block py-2 px-4 text-blue-700 font-semibold";

const UserList: FunctionalComponent = () => {
  const { t } = useContext(TranslateContext);
  const [showDeleted, setShowDeleted] = useState<boolean>(false);
  const [{ data }, refetchUsers] = useQuery<UsersQueryQuery, UsersQueryQueryVariables>({
    query: usersQuery,
    requestPolicy: "cache-and-network",
    variables: {
      deleted: showDeleted,
    },
  });

  const [{}, toggleAdminMode] = useMutation<
    ToggleUserAdminMutation,
    ToggleUserAdminMutationVariables
  >(toggleAdminMutation);

  const [{}, deleteUser] = useMutation<
    DeleteUserMutationMutation,
    DeleteUserMutationMutationVariables
  >(deleteUserMutation);

  const [{}, restoreUser] = useMutation<RestoreUserMutation, RestoreUserMutationVariables>(
    restoreUserMutation,
  );

  return (
    <PageContainer>
      <div class="grid grid-cols-1 md:grid-cols-2 mb-2">
        <h1>{t("pages.userlist.title")}</h1>
        <Link class="md:justify-self-end" href={routes.register}>
          <Button variant="secondary">{t("navigation.addUser")}</Button>
        </Link>
      </div>

      <ul class="flex border-b max-w-md ">
        <li class={cn({ "-mb-px": showDeleted === false }, "mr-1")}>
          <a
            className={cn(tabClasses, {
              [activeTabClasses]: showDeleted === false,
            })}
            href="#active"
            onClick={() => {
              setShowDeleted(false);
              refetchUsers({
                deleted: false,
              });
            }}
          >
            Aktiv
          </a>
        </li>
        <li class={cn({ "-mb-px": showDeleted }, "mr-1")}>
          <a
            className={cn(tabClasses, {
              [activeTabClasses]: showDeleted,
            })}
            href="#deleted"
            onClick={() => {
              setShowDeleted(true);
              refetchUsers({
                deleted: true,
              });
            }}
          >
            Gelöscht
          </a>
        </li>
      </ul>

      <div className="border-b border-l border-r container p-4 max-w-md">
        {data ? (
          <ul className="grid grid-cols-1 gap-4">
            {map(orderBy(data.users, ["firstName", "lastName"]), (user) => {
              return (
                <User
                  deleteUser={deleteUser}
                  refetchUsers={refetchUsers}
                  restoreUser={restoreUser}
                  toggleAdminMode={toggleAdminMode}
                  user={user}
                  key={user.id}
                />
              );
            })}
          </ul>
        ) : null}
      </div>
    </PageContainer>
  );
};

export default UserList;
