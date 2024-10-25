import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';


const PaymentPage = ({ route, navigation }) => {
  const { onPaymentSuccess, membershipType, amount } = route.params;
  const [loading, setLoading] = useState(false);
  const [paypalClientId, setPaypalClientId] = useState('');

  useEffect(() => {
    fetchPayPalClientId();
  }, []);

  const fetchPayPalClientId = async () => {
    try {
      const response = await fetch('http://localhost:3000/paypal-client-id');
      const data = await response.json();
      setPaypalClientId(data.clientId);
    } catch (error) {
      console.error('Error fetching PayPal Client ID:', error);
      Alert.alert('Error', 'Failed to load payment system. Please try again later.');
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/create-paypal-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount.toString(),
          currency: 'ILS',
        }),
      });

      const orderData = await response.json();

      if (response.ok) {
        // Open PayPal in a new window
        const paypalWindow = window.open(orderData.approvalUrl, 'PayPal', 'width=800,height=600');

        
        const pollTimer = setInterval(() => {
          if (paypalWindow.closed) {
            clearInterval(pollTimer);
            handlePaymentCompletion();
          }
        }, 500);
      } else {
        throw new Error(orderData.message || 'Failed to create PayPal order');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Payment Error', error.message || 'There was an error processing your payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentCompletion = async () => {
    try {
      const response = await fetch('http://localhost:3000/check-payment-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.status === 'COMPLETED') {
        Alert.alert('Payment Successful', 'Your payment has been processed successfully.');
        if (onPaymentSuccess) {
          onPaymentSuccess();
        } else {
          navigation.navigate('Home');
        }
      } else if (data.status === 'CANCELLED') {
        Alert.alert('Payment Cancelled', 'Your payment was cancelled.');
      } else {
        Alert.alert('Payment Incomplete', 'Your payment was not completed. Please try again.');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      Alert.alert('Error', 'Failed to verify payment status. Please contact support.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Make a Payment</Text>
      <Text style={styles.membershipType}>{membershipType === 'full' ? 'Full Membership' : 'Partial Membership'}</Text>
      <Text style={styles.amount}>Amount: {amount} ILS</Text>
      <TouchableOpacity style={styles.payButton} onPress={handlePayment} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.payButtonText}>Pay Now with PayPal</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  membershipType: {
    fontSize: 18,
    marginBottom: 10,
    color: '#007BFF',
  },
  amount: {
    fontSize: 18,
    marginBottom: 30,
    color: '#007BFF',
  },
  payButton: {
    backgroundColor: '#0070BA',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PaymentPage;
