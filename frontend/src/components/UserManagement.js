"use client"

import { useState, useEffect } from "react"
import { userService } from "../services/api-service"
import { User, Clock, Shield, Ban, CheckCircle, AlertTriangle, Unlock } from "lucide-react"

function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionInProgress, setActionInProgress] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await userService.getAllUsers()
      setUsers(response.data)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError({
        type: 'error',
        message: err.response?.data?.detail || 
                err.response?.data?.error || 
                err.message || 
                "Erreur lors du chargement des utilisateurs"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUnblockAll = async () => {
    try {
      setActionInProgress(true)
      setError(null)
      await userService.unblockAllUsers()
      await fetchUsers() // Recharger la liste des utilisateurs
      setError({
        type: 'success',
        message: "Tous les utilisateurs ont été débloqués avec succès"
      })
    } catch (err) {
      setError({
        type: 'error',
        message: err.response?.data?.detail || 
                err.response?.data?.error || 
                err.message || 
                "Erreur lors du déblocage des utilisateurs"
      })
    } finally {
      setActionInProgress(false)
    }
  }

  const handleToggleUserStatus = async (userId) => {
    try {
      setActionInProgress(true)
      setError(null)
      const user = users.find(u => u.id === userId)
      await userService.updateUserStatus(userId, !user.is_active)
      
      // Mettre à jour la liste des utilisateurs
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, is_active: !u.is_active }
          : u
      ))

      setError({
        type: 'success',
        message: `L'utilisateur a été ${!user.is_active ? 'débloqué' : 'bloqué'} avec succès`
      })
    } catch (err) {
      setError({
        type: 'error',
        message: err.response?.data?.detail || 
                err.response?.data?.error || 
                err.message || 
                "Erreur lors de la mise à jour du statut de l'utilisateur"
      })
    } finally {
      setActionInProgress(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Gestion des utilisateurs
        </h2>
        <button
          onClick={handleUnblockAll}
          disabled={actionInProgress}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Unlock className="h-4 w-4 mr-2" />
          Débloquer tous les comptes
        </button>
      </div>

      {error && (
        <div className={`p-4 ${error.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} rounded-lg flex items-center gap-2 mx-6 my-4`}>
          {error.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          {error.message}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date d'inscription
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dernière connexion
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(user.date_joined)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.last_login ? formatDate(user.last_login) : "Jamais connecté"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {user.is_active ? "Actif" : "Bloqué"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleToggleUserStatus(user.id)}
                    disabled={actionInProgress || user.is_superuser}
                    className={`inline-flex items-center px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors ${
                      user.is_active
                        ? "border-red-200 text-red-600 hover:bg-red-50"
                        : "border-green-200 text-green-600 hover:bg-green-50"
                    } ${(actionInProgress || user.is_superuser) ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {user.is_active ? (
                      <>
                        <Ban className="h-4 w-4 mr-1" />
                        Bloquer
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Débloquer
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserManagement 