import React, { useState, useEffect } from "react";
import { StyleSheet, SafeAreaView, Image, TouchableOpacity,Text, View, TextInput , AppRegistry, ActivityIndicator, ScrollView } from "react-native";
import AppLoading from "expo-app-loading/build/AppLoading";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium
} from '@expo-google-fonts/poppins';
import Ionicons from '@expo/vector-icons/Ionicons';
import {Feather, AntDesign} from '@expo/vector-icons';
import { gql, useQuery, useMutation} from '@apollo/client'

//Initialisation de l'interface IToDo pour typer les todos
interface IToDo {
  id: string;
  text: string;
  isCompleted: boolean;
}
//

//Query pour recuperer les donnees de la base de donnee
const GET_TODOS = gql`
    query {
        todos {
            id
            text
            isCompleted
        }
    }
`;
//


 export default  function Todo (props) {

  const [value, setValue] = useState<string>("");
  const [isError, showError] = useState<Boolean>(false);
  //CRUD
  const CREATE_TODO = gql`
    mutation ($text: String!) {
    createTodo(data: {
        text: $text
        isCompleted: false
    }){
        id
        text
    }
    } 
`

const UPDATE_TODO = gql`
mutation ($id: ID!, $isCompleted: Boolean!) {
  updateTodo(where:{
    id: $id,
  }, data: {
    isCompleted: $isCompleted
  }){
    id 
    text
    isCompleted
  }
}
`

const DELETE_TODO = gql`
mutation($id: ID!){
  deleteTodo(where: {
    id: $id
  }){
    text
    isCompleted
  }
}
`
//

// Chargement de la police poppins
let [fontsLoaded] = useFonts({
  Poppins_400Regular,
  Poppins_500Medium
})
//

//Mise en place de la date
const date = new Date()
let weekday = new Array('Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi')
const dayOfWeek = weekday[date.getDay()].toString()
const numberDate = String(date.getDate()).padStart(2, '0')
//

  const IconButton = ({onPress, icon, isLoading }) => (
    <TouchableOpacity style={{ backgroundColor: "#009b80", width: "23%", borderRadius: 4,alignItems: 'center', }}  onPress={onPress}>
      {!isLoading ? icon : <ActivityIndicator color="#fff" size={36} style={{ top: "5%"}}  /> }
    </TouchableOpacity>
  );
  const IconButtonAction = ({ icon, onPress, width }) => (
    <TouchableOpacity style={{width: width, alignItems: 'center', }}  onPress={onPress} >
      {icon}
    </TouchableOpacity>
  );
  // Recuperation et stockage dans la variable data
  const {loading, error, data} = useQuery(GET_TODOS)

  // Ajout d'une tache dans la base de donne
  const handleSubmit = (): void => {
    if (value){
      addTodo({ variables: {text: value}, refetchQueries: [{ query: GET_TODOS}]}) 
    }
    else showError(true);
    setValue("");
  };
  //

  // Suppression d'une tache dans la base de donnee
  const removeItem = (index: string): void => {
    deleteTodo({
        variables:{
            id:index
        },
        refetchQueries: [{ query: GET_TODOS}]
    })
  };
  //

  // Modification de la completion de la tache dans la base de donnee
  const toggleComplete = (index: string, completed: Boolean): void => {
    updateTodo({variables: 
    {
        id: index,
        isCompleted: completed 
    }})
  };
  //
  
 
  const [addTodo, addData] = useMutation(CREATE_TODO)
  const [updateTodo, ] = useMutation(UPDATE_TODO, )
  const [deleteTodo, ] = useMutation(DELETE_TODO)
  
  
  if(!fontsLoaded)
    return <AppLoading/>
  
  if (loading) return (
    <View style={[styles.container, styles.horizontal]}>
        <ActivityIndicator size="large" color="#fff" />
    </View>
  );
  if (error) return <Text style={{ alignContent: "center", textAlign: "center", top: 400}}>  `Error! ${error.message}` </Text> ;
  else{
    return (
        
        <SafeAreaView style={styles.container}>
            <View style={styles.containerView}>
                <View style={styles.headerWrapper}>
                <Text style={styles.title}>{dayOfWeek}, {numberDate}</Text>
                <Image
                    source={require('./assets/pro.jpg')}
                    style={{width: 40, height: 40, borderRadius: 400/ 2}}
                />
                </View>
            
            <View style={styles.inputWrapper}>
                <TextInput
                    placeholder="Entre vos taches..."
                    placeholderTextColor="#727272"
                    value={value}
                    onChangeText={e => {
                      setValue(e);
                      showError(false);
                    }}
                    style={
                      [styles.inputBox, { borderColor: isError ? "#DC3545" : "#727272"}]
                    }
                />
              <IconButton isLoading={addData.loading} onPress={handleSubmit} icon={<Ionicons name="md-add" size={36} color="#fff" style={{ top: "5%"}} />} />
            
            </View>
            {isError && (
                <Text style={styles.error}>Veuillez entrer une tache pour continuer</Text>
            )}
                {data.todos.length === 0 && 
                <View style={styles.imageContainer}>
                    <Image
                    source={require('./assets/Tasks.png')}
                    style={styles.ImageLogo}
                    />
                    <Text style={styles.emptyText}> Vous n'avez pas de taches pour l'instant, ajoutez en une </Text>
                </View>
                }
                <ScrollView style={{ }}>
                      {data.todos.map((toDo: IToDo) => (
                      <View style={styles.listItem} key={toDo.id}>
                          {
                          toDo.isCompleted ? <IconButtonAction width={24}  icon={<Feather name="check-circle" size={20} color="#009b80" style={{ top: "20%"}}  />} onPress= {() => toggleComplete(toDo.id, false)}  /> : 
                          <IconButtonAction width={24} icon={<Feather name="circle" size={20} color="#727272" style={{ top: "20%"}} />} onPress={() => toggleComplete(toDo.id, true)} />
                          }
                          
                          <Text
                              style={[
                              styles.task,
                              { textDecorationLine: toDo.isCompleted ? "line-through" : "none" },
                              { opacity: toDo.isCompleted ? 0.5 : 1}
                              ]}
                          >
                              {toDo.text}
                          </Text>

                          <IconButtonAction
                              width={"10%"}
                              onPress={() => {
                                  removeItem(toDo.id);
                              }}
                              icon={<AntDesign name="delete" size={24} color="#DC3545" style={{ top: "20%"}} />}
                          />
                      </View>
                      ))}
                </ScrollView>
            
            </View>
        </SafeAreaView>
        
    );
}
}

const styles = StyleSheet.create({
  container: {
    flex: 2,
    backgroundColor:"#191928"
   
  },
  containerView:{
    padding:20,
  },
  inputWrapper: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20
  },
  headerWrapper: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    
  },
  inputBox: {
    width: "75%",
    borderRadius: 4,
    color: "#fff", 
    fontFamily: 'Poppins_500Medium',
    borderWidth: 1,
    paddingLeft: 8
  },
  horizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10
  },
  imageContainer: {
    paddingTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: "column",
  },
  emptyText: {
    fontSize: 20,
    textAlign: "center",
    marginTop: 10,
    fontWeight: "bold",
    fontFamily: "Poppins_500Medium",
    color: "#fff"
  },
  ImageLogo: {
    width: 220,
    height: 200,
  },
  title: {
    fontSize: 25,
    marginBottom: 30,
    fontWeight: "bold",
    fontFamily: "Poppins_500Medium",
    color: "#fff"
    
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 20,
    color: "purple"
  },
  listItem: {
    height: 50,
    backgroundColor: "#242439",
    borderRadius: 2,
    padding: 7,
    flexDirection: "row",
    width: "100%",
    marginBottom: 10,
    color: "#fff",
    justifyContent: "space-around"
  },
  addButton: {
    alignItems: "flex-end"
  },
  task: {
    top: 8,
    color: "#fff",
    fontFamily:"Poppins_500Medium",
    width: 200
  },
  error: {
    color: "#DC3545",
    fontFamily:"Poppins_500Medium",
    marginBottom: 10
  }
});

