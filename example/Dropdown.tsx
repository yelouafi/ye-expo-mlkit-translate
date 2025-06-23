import React from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface DropdownProps<T> {
  data: T[];
  value: string;
  onSelect: (value: string) => void;
  visible: boolean;
  onClose: () => void;
  title: string;
  keyExtractor: (item: T) => string;
  labelExtractor: (item: T) => string;
  valueExtractor: (item: T) => string;
  placeholder?: string;
}

export function Dropdown<T>({
  data,
  value,
  onSelect,
  visible,
  onClose,
  title,
  keyExtractor,
  labelExtractor,
  valueExtractor,
  placeholder = "Select...",
}: DropdownProps<T>) {
  const selectedItem = data.find((item) => valueExtractor(item) === value);
  const displayLabel = selectedItem
    ? labelExtractor(selectedItem)
    : placeholder;

  const handleSelect = (item: T) => {
    onSelect(valueExtractor(item));
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={keyExtractor}
            renderItem={({ item }) => {
              const isSelected = valueExtractor(item) === value;
              return (
                <TouchableOpacity
                  style={[styles.option, isSelected && styles.selectedOption]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.selectedOptionText,
                    ]}
                  >
                    {labelExtractor(item)}
                  </Text>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

export interface DropdownTriggerProps {
  onPress: () => void;
  label: string;
  placeholder?: string;
}

export function DropdownTrigger({
  onPress,
  label,
  placeholder = "Select...",
}: DropdownTriggerProps) {
  return (
    <TouchableOpacity style={styles.dropdownButton} onPress={onPress}>
      <Text style={styles.dropdownButtonText}>{label || placeholder}</Text>
      <Text style={styles.dropdownArrow}>▼</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 12,
    paddingVertical: 15,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5e9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: "#666",
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedOption: {
    backgroundColor: "#f0f8ff",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedOptionText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "bold",
  },
});
