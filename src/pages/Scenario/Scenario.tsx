import { useEffect, useState } from "react"
import getCurrentPlayer from "@/utils/currentPlayer"
import { setLocalScenario } from "@/utils/localScenario"
import { createChrono } from "@/utils/chrono"
import { gql, useMutation, useQuery } from "@apollo/client"
import { PlayerScript, ScriptStep } from "@exploregame/types"
import toast from "react-hot-toast"
import { useNavigate, useParams } from "react-router-dom"
import { useScriptProgress } from "@/context/ScriptProgressContext"

export const SCENARIO = gql`
  query FindScenarioById($id: String!) {
    script(id: $id) {
      id
      name
      ScriptStep {
        stepId
        Step {
          id
          Questions {
            id
          }
        }
      }
      PlayerScript {
        id
        playerId
        stepId
        questionId
        completed
        remainingTime
        score
      }
    }
  }
`;

export const CREATE_PLAYER_SCRIPT = gql`
  mutation createPlayerScript($input: CreatePlayerScriptInput!) {
    createPlayerScript(input: $input) {
      id
    }
  }
`;

const ScenarioPage = () => {
  const navigate = useNavigate()
  const currentPlayer = getCurrentPlayer()
  const { setTotalQuestions, setCurrentQuestion } = useScriptProgress()
  const { depId, sceId } = useParams()
  const [createPlayerScript] = useMutation(CREATE_PLAYER_SCRIPT)
  const { data, loading, error, refetch } = useQuery(SCENARIO, {
    variables: { id: sceId },
  })
  const [loadingTooLong, setLoadingTooLong] = useState(false)

  useEffect(() => {
    let loadingTimer: number | null = null;
    
    if (loading) {
      loadingTimer = window.setTimeout(() => {
        setLoadingTooLong(true)
      }, 10000) // 10 seconds
    }
    
    return () => {
      if (loadingTimer) clearTimeout(loadingTimer)
    }
  }, [loading])

  useEffect(() => {
    if (!currentPlayer) {
      toast.error("You must be logged in to play a scenario.");
      navigate("/login")
      return
    }

    if (loading || error) return

    const totalQuestions = data.script.ScriptStep.reduce((acc: number, scriptStep: ScriptStep) => {
      return acc + scriptStep.Step.Questions.length
    }, 0)
    setTotalQuestions(totalQuestions)

    const alreadyPlayed = () => {
      return data.script.PlayerScript.some(
        (playerScript: PlayerScript) =>
          playerScript.playerId === currentPlayer!.id
      )
    }

    const alreadyCompleted = () => {
      return data.script.PlayerScript.some(
        (playerScript: PlayerScript) =>
          playerScript.playerId === currentPlayer!.id && playerScript.completed
      )
    }

    const redirect = (stepId: string, questionId: string) => {
      navigate(
        `/departments/${depId}/scenarios/${sceId}/steps/${stepId}/questions/${questionId}`
      )
    }

    const init = () => {
      // ! Data
      const initScenarioData = {
        playerId: currentPlayer!.id,
        scriptId: sceId,
        stepId: data.script.ScriptStep[0].stepId,
        questionId: data.script.ScriptStep[0].Step.Questions[0].id,
        score: 0,
        remainingTime: 3600,
      };

      // ! Mutation
      createPlayerScript({
        variables: {
          input: {
            ...initScenarioData,
            completed: false,
          },
        },
      }).then((response) => {
        // ! Redirection
        const idPlayerScript = response.data.createPlayerScript.id
        setLocalScenario(idPlayerScript, currentPlayer!.id, sceId!, initScenarioData.stepId, initScenarioData.questionId, initScenarioData.remainingTime, initScenarioData.score)
        createChrono(initScenarioData.remainingTime)
        redirect(initScenarioData.stepId, initScenarioData.questionId)
      })
    }

    const resume = () => {
      // ! Data
      const playerScript = data.script.PlayerScript.find((playerScript: PlayerScript) => playerScript.playerId === currentPlayer!.id)
      const { id, stepId, questionId, remainingTime, score } = playerScript

      // ! Redirection
      createChrono(remainingTime)
      setLocalScenario(id, currentPlayer!.id, sceId!, stepId, questionId, remainingTime, score);
      redirect(stepId, questionId);
    }

    if (alreadyCompleted()) {
      toast.success("Vous avez déjà terminé ce scénario")
      navigate(`/departments/${depId}`)
      return
    }

    refetch().then(() => {
      if (!alreadyPlayed()) {
        setCurrentQuestion(0)
        init() 
      } else {
        resume()
      }
    })
  }, [currentPlayer, data, loading, error, refetch, createPlayerScript])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (loading && !loadingTooLong) {
    return (
      <section className="flex flex-col items-center justify-center p-8 gap-4 h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-lg">Chargement du scénario...</p>
        <button
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          onClick={() => navigate(`/departments/${depId}`)}
        >
          Retour en arrière
        </button>
      </section>
    )
  }
  
  if (error || loadingTooLong) {
    return (
      <section className="flex flex-col items-center justify-center p-8 gap-4 h-screen">
        <h2 className="text-xl font-semibold text-red-600">Une erreur est survenue</h2>
        <p className="text-center">
          {loadingTooLong 
            ? "Le chargement du scénario prend trop de temps. Veuillez vérifier votre connexion internet et réessayer."
            : "Nous n'avons pas pu charger votre scénario. Veuillez réessayer ultérieurement."}
        </p>
        {error && <p className="text-sm text-gray-500">{error}</p>}
        <button
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={() => navigate(`/departments/${depId}`)}
        >
          Retour en arrière
        </button>
      </section>
    )
  }

  // Default UI (if neither loading nor error)
  return (
    <section className="flex flex-col items-center justify-center p-8 gap-4 h-screen">
      <h2 className="text-xl font-semibold text-red-600">Une erreur est survenue</h2>
      <p className="text-center">Nous n'avons pas pu charger votre scénario. Veuillez réessayer ultérieurement.</p>
      <button
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        onClick={() => navigate(`/departments/${depId}`)}
      >
        Retour en arrière
      </button>
    </section>
  )
}

export default ScenarioPage;
